import { BaseCommand, FsLoader, Kernel, flags } from '@adonisjs/core/ace'
import cron from 'node-cron'
import AsyncLock from 'async-lock'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { ChildProcess, spawn } from 'child_process'
import chokidar from 'chokidar'

const lock = new AsyncLock()

interface IRunOptions {
  enabled: boolean
  timeout: number
  key: string
  onBusy?: () => any | PromiseLike<any>
}

const run = async (cb: () => any | PromiseLike<any>, options: IRunOptions) => {
  if (!options.enabled) return await cb()

  if (lock.isBusy(options.key)) {
    if (options.onBusy) {
      await options.onBusy()
    }
    return
  }

  await lock.acquire(options.key, cb, { maxPending: 1, timeout: options.timeout })
}

export default class SchedulerCommand extends BaseCommand {
  static commandName = 'scheduler:run'
  static description = ''
  static aliases: string[] = ['scheduler:work', 'schedule:work', 'schedule:run']

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  @flags.boolean({ description: 'Restart the scheduler on file changes' })
  declare watch: boolean

  tasks: cron.ScheduledTask[] = []

  prepare() {
    this.app.terminating(async () => {
      for (const task of this.tasks) {
        task.stop()
      }
    })
  }

  public async run() {
    if (this.watch) {
      return await this.runAndWatch()
    }

    const schedule = await this.app.container.make('scheduler')
    await schedule.boot()
    const fsLoader = new FsLoader<typeof BaseCommand>(this.app.commandsPath())
    const loaders: any[] = [fsLoader]

    this.app.rcFile.commands.forEach((commandModule) => {
      loaders.push(() =>
        typeof commandModule === 'function' ? commandModule() : this.app.import(commandModule)
      )
    })

    const logger = await this.app.container.make('logger')

    if (schedule.onStartingCallback) {
      await schedule.onStartingCallback()
    }

    for (let index = 0; index < schedule.items.length; index++) {
      const command = schedule.items[index]
      this.tasks.push(
        cron.schedule(
          command.expression,
          async () => {
            try {
              switch (command.type) {
                case 'command':
                  const ace = new Kernel(this.app)

                  for (const loader of loaders) {
                    ace.addLoader(loader)
                  }

                  for (const callback of command.beforeCallbacks) {
                    await callback()
                  }
                  await run(() => ace.exec(command.commandName, command.commandArgs), {
                    enabled: command.config.withoutOverlapping,
                    timeout: command.config.expiresAt,
                    key: `${index}-${command.commandName}-${command.commandArgs}`,
                    onBusy: () => {
                      logger.warn(
                        `Command ${index}-${command.commandName}-${command.commandArgs} is busy`
                      )
                    },
                  })
                  for (const callback of command.afterCallbacks) {
                    await callback()
                  }
                  break

                case 'callback':
                  for (const callback of command.beforeCallbacks) {
                    await callback()
                  }
                  await run(() => command.callback(), {
                    enabled: command.config.withoutOverlapping,
                    timeout: command.config.expiresAt,
                    key: `${index}-callback`,
                    onBusy: () => {
                      logger.warn(`Callback ${index} is busy`)
                    },
                  })
                  for (const callback of command.afterCallbacks) {
                    await callback()
                  }

                default:
                  break
              }
            } catch (error) {
              logger.error(error)
            }
          },
          {
            scheduled: command.config.enabled,
            timezone: command.config.timezone,
            runOnInit: command.config.enabled && command.config.immediate,
          }
        )
      )
    }

    logger.info(`Schedule worker started successfully.`)

    if (schedule.onStartedCallback) {
      await schedule.onStartedCallback()
    }
  }

  public async runAndWatch() {
    const logger = await this.app.container.make('logger')
    let child: ChildProcess

    const startProcess = () => {
      if (child) child.kill()
      child = spawn('node', ['ace.js', 'scheduler:run'], { stdio: 'inherit' })
    }

    const watcher = chokidar.watch([this.app.appRoot.pathname], {
      //@ts-ignore
      ignored: (path, stats) => {
        if (path.includes('node_modules') || path.includes('.git') || path.includes('build')) {
          return true
        }

        return stats?.isFile() && !path.endsWith('.ts') && !path.endsWith('.js')
      },
      persistent: true,
      ignoreInitial: true,
    })

    let timeoutId: NodeJS.Timeout

    watcher.on('all', (event, path) => {
      if (typeof path === 'string') {
        logger.info(
          `File ${path.replace(this.app.appRoot.pathname, '')} changed (${event}), restarting...`
        )
      }
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        startProcess()
      }, 300)
    })

    startProcess()

    this.app.terminating(async () => {
      if (child) child.kill()
      process.exit()
    })
  }
}
