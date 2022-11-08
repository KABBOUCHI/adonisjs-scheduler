import { BaseCommand } from '@adonisjs/core/build/standalone'
import cron from 'node-cron'

export default class SchedulerCommand extends BaseCommand {
  public static commandName = 'scheduler:run'
  public static description = ''

	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

  public async run() {
      const Scheduler = this.application.container.use('Adonis/Addons/Scheduler');
      const Ace = this.application.container.use('Adonis/Core/Ace');

      for (const command of Scheduler.commands) {
        cron.schedule(command.expression, async () => {
            await Ace.exec(command.commandName, command.commandArgs);
        })
      }
  }
}
