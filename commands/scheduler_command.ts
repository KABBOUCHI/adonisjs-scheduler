import { BaseCommand, FsLoader, Kernel } from '@adonisjs/core/ace'
import cron from 'node-cron'
import AsyncLock from 'async-lock';
import { CommandOptions } from '@adonisjs/core/types/ace';

const lock = new AsyncLock();

interface IRunOptions {
  enabled: boolean
  timeout: number
  key: string
  onBusy?: () => any | PromiseLike<any>
}

const run = async (cb: () => any | PromiseLike<any>, options: IRunOptions) => {
  if (!options.enabled)
    return await cb()

  if (lock.isBusy(options.key)) {
    if (options.onBusy) {
      await options.onBusy()
    }
    return;
  }

  await lock.acquire(options.key, cb, { maxPending: 1, timeout: options.timeout })
}

export default class SchedulerCommand extends BaseCommand {
  static commandName = 'scheduler:run'
  static description = ''
  static aliases: string[] = [
    'scheduler:work',
    'schedule:work',
    'schedule:run',
  ]

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true
  }

  tasks: cron.ScheduledTask[] = []

  prepare() {
    this.app.terminating(async () => {
      for (const task of this.tasks) {
        task.stop()
      }
    })
  }

  public async run() {
    const schedule = await this.app.container.make("scheduler")
    const logger = await this.app.container.make("logger")

    if (schedule.onStartingCallback) {
      await schedule.onStartingCallback()
    }

    for (let index = 0; index < schedule.items.length; index++) {
      const command = schedule.items[index];
      this.tasks.push(
        cron.schedule(command.expression, async () => {
          try {
            switch (command.type) {
              case "command":
                const ace = new Kernel(this.app)

                this.app.rcFile.commands.forEach((commandModule) => {
                  ace.addLoader(() =>
                    typeof commandModule === 'function' ? commandModule() : this.app.import(commandModule)
                  )
                })

                const fsLoader = new FsLoader<typeof BaseCommand>(this.app.commandsPath())
                ace.addLoader({
                  async getMetaData() {
                    if (!command.commandName || !ace.getCommand(command.commandName)) {
                      return fsLoader.getMetaData()
                    }
                    return []
                  },
                  getCommand(command) {
                    return fsLoader.getCommand(command)
                  },
                })
                await run(() => ace.exec(command.commandName, command.commandArgs), {
                  enabled: command.config.withoutOverlapping,
                  timeout: command.config.expiresAt,
                  key: `${index}-${command.commandName}-${command.commandArgs}`,
                  onBusy: () => {
                    logger.warn(`Command ${index}-${command.commandName}-${command.commandArgs} is busy`)
                  }
                })
                break;

              case "callback":
                await run(() => command.callback(), {
                  enabled: command.config.withoutOverlapping,
                  timeout: command.config.expiresAt,
                  key: `${index}-callback`,
                  onBusy: () => {
                    logger.warn(`Callback ${index} is busy`)
                  }
                })

              default:
                break;
            }
          } catch (error) {
            logger.error(error)
          }
        }, {
          scheduled: command.config.enabled,
          runOnInit: command.config.enabled && command.config.immediate
        })
      )
    }

    logger.info(`Schedule worker started successfully.`);

    if (schedule.onStartedCallback) {
      await schedule.onStartedCallback()
    }
  }
}
