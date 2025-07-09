import type { BaseCommand } from '@adonisjs/core/ace'
import { ScheduleCommand, Scheduler } from './scheduler.js'
import { arrayWrap } from './utils.js'

export function schedule(
  expression: string | ((s: ScheduleCommand) => ScheduleCommand),
  args: string | string[] = [],
  name?: string,
) {
  return function <T extends typeof BaseCommand>(target: T) {
    if (typeof expression === 'string') {
      const scheduleCommand = new ScheduleCommand(target.commandName, arrayWrap(args)).cron(expression)

      if(name) {
        scheduleCommand.as(name)
      }
      Scheduler.__decorator_schedules.push( scheduleCommand )
    } else {
      const scheduleCommand =new ScheduleCommand(target.commandName, arrayWrap(args)) 
      if(name) {
        scheduleCommand.as(name)
      }

      Scheduler.__decorator_schedules.push(
        expression(scheduleCommand)
      )
    }

    return target
  }
}
