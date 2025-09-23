import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { ChildProcess, spawn } from 'child_process'
import chokidar from 'chokidar'
import { Worker } from '../src/worker.js'

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

  @flags.string({ description: 'Tag for the scheduler', default: 'default' })
  declare tag: string

  declare worker: Worker

  prepare() {
    this.app.terminating(async () => {
      if (this.worker) await this.worker.stop()
    })
  }

  public async run() {
    if (this.watch) {
      return await this.runAndWatch()
    }

    this.worker = new Worker(this.app)
    await this.worker.start(this.tag)
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
