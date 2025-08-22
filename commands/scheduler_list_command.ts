import { BaseCommand, cliHelpers } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { CronExpressionParser } from 'cron-parser'
import { DateTime } from 'luxon'
import stringWidth from 'string-width'

export default class SchedulerCommand extends BaseCommand {
  static commandName = 'scheduler:list'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  public async run() {
    const schedule = await this.app.container.make('scheduler')
    await schedule.boot()

    const items: any[] = []
    for (let index = 0; index < schedule.items.length; index++) {
      const command = schedule.items[index]

      const commandName =
        command.type === 'callback'
          ? `Closure #${index + 1}`
          : `node ace ${command.commandName}` +
            (command.commandArgs.length
              ? ` ${this.ui.colors.cyan(command.commandArgs.join(' '))}`
              : '')

      let nextDueDate: string | null = null

      if (!command.config.enabled) {
        nextDueDate = 'Disabled'
      } else {
        const cron = CronExpressionParser.parse(command.expression, {
          tz: command.config.timezone,
        })
        nextDueDate = DateTime.fromJSDate(cron.next().toDate()).toRelative()
      }

      items.push({
        expression: ` ${this.ui.colors.yellow(command.expression)} `,
        commandName: ` ${commandName} `,
        nextDueDate: this.ui.colors.dim(` Next Due: ${nextDueDate}`),
      })
    }

    const expressions = items.map((item) => item.expression)
    const largestExpressionLength = Math.max(...expressions.map((e) => stringWidth(e)))
    const formattedExpressions = cliHelpers.justify(expressions, {
      maxWidth: largestExpressionLength,
    })

    const commands = items.map((item) => item.commandName)
    const largestCommandLength = Math.max(...commands.map((e) => stringWidth(e)))
    const formattedCommands = cliHelpers.justify(commands, {
      maxWidth: largestCommandLength,
      paddingChar: this.ui.colors.dim('.'),
    })

    const dates = items.map((item) => item.nextDueDate)
    const largestDateLength =
      cliHelpers.TERMINAL_SIZE - (largestExpressionLength + largestCommandLength) - 10
    const formattedDates = cliHelpers.truncate(
      cliHelpers.justify(dates, {
        maxWidth: largestDateLength,
        align: 'right',
        paddingChar: this.ui.colors.dim('.'),
      }),
      {
        maxWidth: largestDateLength,
      }
    )

    for (let index = 0; index < formattedExpressions.length; index++) {
      const expression = formattedExpressions[index]
      const command = formattedCommands[index]
      const date = formattedDates[index]

      this.logger.log(`${expression}${command}${date}`)
    }
  }
}
