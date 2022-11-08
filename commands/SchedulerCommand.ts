import { BaseCommand } from '@adonisjs/core/build/standalone'
import Ace from '@ioc:Adonis/Core/Ace'
import Scheduler from '@ioc:Adonis/Addons/Scheduler'
import cron from 'node-cron'

export default class SchedulerCommand extends BaseCommand {
  public static commandName = 'scheduler:run'
  public static description = ''

	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

  public async run() {
      for (const command of Scheduler.commands) {
        cron.schedule(command.expression, async () => {
            await Ace.exec(command.commandName, command.commandArgs);
        })
      }
  }
}
