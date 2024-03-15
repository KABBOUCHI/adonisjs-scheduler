import { BaseCommand } from '@adonisjs/core/build/standalone'
import cron from 'node-cron'
import type { Scheduler } from '../src/scheduler'

import AsyncLock from 'async-lock';

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

  const unlock = await lock.acquire(options.key, cb, { maxPending: 1, timeout: options.timeout })

  unlock();
}

export default class SchedulerCommand extends BaseCommand {
  public static commandName = 'scheduler:run'
  public static description = ''
  public static aliases: string[] = [
    'scheduler:work',
    'schedule:work',
    'schedule:run',
  ]

  public static settings = {
    loadApp: true,
    stayAlive: true,
  };

  public async run() {
    const Scheduler = this.application.container.use('Adonis/Addons/Scheduler') as Scheduler;
    const Ace = this.application.container.use('Adonis/Core/Ace');
    const Logger = this.application.container.use('Adonis/Core/Logger');

    const tasks: cron.ScheduledTask[] = []

    process.on('SIGTERM', () => {
      Logger.info(`SIGTERM received. Stopping all tasks...`)

      for (const task of tasks) {
        task.stop()
      }

      process.exit(0)
    })

    process.on('SIGINT', () => {
      Logger.info(`SIGINT received. Stopping all tasks...`)
      for (const task of tasks) {
        task.stop()
      }

      process.exit(0)
    })

    for (let index = 0; index < Scheduler.items.length; index++) {
      const command = Scheduler.items[index];
      tasks.push(
        cron.schedule(command.expression, async () => {
          switch (command.type) {
            case "command":
              await run(() => Ace.exec(command.commandName, command.commandArgs), {
                enabled: command.config.withoutOverlapping,
                timeout: command.config.expiresAt,
                key: `${index}-${command.commandName}-${command.commandArgs}`,
                onBusy: () => {
                  Logger.warn(`Command ${index}-${command.commandName}-${command.commandArgs} is busy`)
                }
              })
              break;

            case "callback":
              await run(() => command.callback(), {
                enabled: command.config.withoutOverlapping,
                timeout: command.config.expiresAt,
                key: `${index}-callback`,
                onBusy: () => {
                  Logger.warn(`Callback ${index} is busy`)
                }
              })

            default:
              break;
          }
        }, {
          scheduled: command.config.enabled,
          runOnInit: command.config.enabled && command.config.immediate
        })
      )
    }

    Logger.info(`Schedule worker started successfully.`);
  }
}
