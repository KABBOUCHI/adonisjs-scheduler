import { BaseCommand } from '@adonisjs/core/build/standalone'
import cron from 'node-cron'
import type { Scheduler } from '../src/scheduler'

import AsyncLock from 'async-lock';

const lock = new AsyncLock();

interface IRunOptions {
  enabled: boolean
  timeout: number
  key: string
}

const run = async (cb: () => any | PromiseLike<any>, options: IRunOptions) => {
  if (!options.enabled)
    await cb()

  if(lock.isBusy(options.key)) {
    console.log(`${options.key} is busy`)
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

    for (let index = 0; index < Scheduler.items.length; index++) {
      const command = Scheduler.items[index];
      cron.schedule(command.expression, async () => {
        switch (command.type) {
          case "command":
            await run(() => Ace.exec(command.commandName, command.commandArgs), {
              enabled: command.config.withoutOverlapping,
              timeout: command.config.expiresAt,
              key: `${index}-${command.commandName}-${command.commandArgs}`
            })
            break;

          case "callback":
            await run(() => command.callback(), {
              enabled: command.config.withoutOverlapping,
              timeout: command.config.expiresAt,
              key: `${index}-callback`
            })

          default:
            break;
        }
      }, {
        runOnInit: command.config.immediate
      })
    }

    this.logger.info(`Schedule worker started successfully.`);
  }
}
