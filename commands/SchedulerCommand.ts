import { BaseCommand } from '@adonisjs/core/build/standalone'
import cron from 'node-cron'

export default class SchedulerCommand extends BaseCommand {
  public static commandName = 'scheduler:run'
  public static description = ''
  public static aliases: string[] = [
    'scheduler:work'
  ]

  public static settings = {
    loadApp: true,
    stayAlive: true,
  };

  public async run() {
    const Scheduler = this.application.container.use('Adonis/Addons/Scheduler');
    const Ace = this.application.container.use('Adonis/Core/Ace');

    for (const command of Scheduler.items) {
      cron.schedule(command.expression, async () => {
        switch (command.type) {
          case "command":
            await Ace.exec(command.commandName, command.commandArgs)
            break;

          case "callback":
            await command.callback();

          default:
            break;
        }
      })
    }
  }
}
