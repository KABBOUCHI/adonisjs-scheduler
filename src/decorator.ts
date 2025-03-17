import type { BaseCommand } from '@adonisjs/core/ace'
import { ScheduleCommand, Scheduler } from './scheduler.js'
import { arrayWrap } from './utils.js'

export function schedule(
  expression: string | ((s: ScheduleCommand) => ScheduleCommand),
  args: string | string[] = []
) {
  return function <T extends typeof BaseCommand>(target: T) {
    if (typeof expression === 'string') {
      Scheduler.__decorator_schedules.push(
        new ScheduleCommand(target.commandName, arrayWrap(args)).cron(expression)
      )
    } else {
      Scheduler.__decorator_schedules.push(
        expression(new ScheduleCommand(target.commandName, arrayWrap(args)))
      )
    }

    return target
  }
}
