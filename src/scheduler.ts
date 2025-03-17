import { BaseCommand, FsLoader } from '@adonisjs/core/ace'
import type { ApplicationService } from '@adonisjs/core/types'
import { DateTime } from 'luxon'
import { arrayWrap } from './utils.js'

type Range<
  START extends number,
  END extends number,
  ARR extends unknown[] = [],
  ACC extends number = never
> = ARR['length'] extends END
  ? ACC | START | END
  : Range<START, END, [...ARR, 1], ARR[START] extends undefined ? ACC : ACC | ARR['length']>

export abstract class BaseSchedule {
  abstract type: string
  expression: string = '0 * * * * *' // seconds minutes hours dayOfMonth month dayOfWeek
  config = {
    enabled: true,
    immediate: false,
    withoutOverlapping: false,
    expiresAt: 3600000,
    timezone: undefined as string | undefined,
  }

  beforeCallbacks: (() => Promise<void>)[] = []
  afterCallbacks: (() => Promise<void>)[] = []

  public before(callback: () => Promise<void>) {
    this.beforeCallbacks.push(callback)

    return this
  }

  public after(callback: () => Promise<void>) {
    this.afterCallbacks.push(callback)

    return this
  }

  public timezone(timezone: string) {
    this.config.timezone = timezone

    return this
  }

  public skip(state: boolean = true) {
    this.config.enabled = !state

    return this
  }

  public immediate(state: boolean = true) {
    this.config.immediate = state

    return this
  }

  public withoutOverlapping(expiresAt: number = 3600000) {
    this.config.withoutOverlapping = true
    this.config.expiresAt = expiresAt

    return this
  }

  public everyMinutes(minutes: number) {
    return this.spliceIntoPosition(1, `*/${minutes}`)
  }

  public everyMinute() {
    return this.spliceIntoPosition(1, '*')
  }

  public everyTwoMinutes() {
    return this.everyMinutes(2)
  }

  public everyThreeMinutes() {
    return this.everyMinutes(3)
  }

  public everyFourMinutes() {
    return this.everyMinutes(4)
  }

  public everyFiveMinutes() {
    return this.everyMinutes(5)
  }

  public everyTenMinutes() {
    return this.everyMinutes(10)
  }

  public everyFifteenMinutes() {
    return this.everyMinutes(15)
  }

  public everyThirtyMinutes() {
    return this.everyMinutes(30)
  }

  public hourly() {
    return this.spliceIntoPosition(1, 0)
  }

  public hourlyAt(offset: string | number | Range<0, 59> | Range<0, 59>[]) {
    return this.hourBasedSchedule(offset, '*')
  }

  public everyHours(hours: number, offset: any[] | string | number = 0) {
    return this.hourBasedSchedule(offset, `*/${hours}`)
  }
  public everyOddHour(offset: any[] | string | number = 0) {
    return this.hourBasedSchedule(offset, '1-23/2')
  }

  public everyTwoHours(offset: any[] | string | number = 0) {
    return this.everyHours(2, offset)
  }

  public everyThreeHours(offset: any[] | string | number = 0) {
    return this.everyHours(3, offset)
  }

  public everyFourHours(offset: any[] | string | number = 0) {
    return this.everyHours(4, offset)
  }

  public everyFiveHours(offset: any[] | string | number = 0) {
    return this.everyHours(5, offset)
  }

  public everySixHours(offset: any[] | string | number = 0) {
    return this.everyHours(6, offset)
  }

  public daily() {
    return this.hourBasedSchedule(0, 0)
  }

  public weekdays() {
    return this.spliceIntoPosition(5, '1-5')
  }

  public weekends() {
    return this.spliceIntoPosition(5, '6,0')
  }

  public mondays() {
    return this.days(1)
  }

  public tuesdays() {
    return this.days(2)
  }

  public wednesdays() {
    return this.days(3)
  }

  public thursdays() {
    return this.days(4)
  }

  public fridays() {
    return this.days(5)
  }

  public saturdays() {
    return this.days(6)
  }

  public sundays() {
    return this.days(0)
  }

  public weekly() {
    return this.spliceIntoPosition(1, 0).spliceIntoPosition(2, 0).spliceIntoPosition(5, 0)
  }

  public weeklyOn(dayOfWeek: Range<0, 7> = 1, time: string = '0:0') {
    this.dailyAt(time)

    return this.days(dayOfWeek as any)
  }

  public monthly() {
    return this.spliceIntoPosition(1, 0).spliceIntoPosition(2, 0).spliceIntoPosition(3, 1)
  }

  public quarterly() {
    return this.spliceIntoPosition(1, 0)
      .spliceIntoPosition(2, 0)
      .spliceIntoPosition(3, 1)
      .spliceIntoPosition(4, '1-12/3')
  }

  public yearly() {
    return this.spliceIntoPosition(1, 0)
      .spliceIntoPosition(2, 0)
      .spliceIntoPosition(3, 1)
      .spliceIntoPosition(4, 1)
  }

  public yearlyOn(month: number = 1, dayOfMonth: string | Range<1, 31> = 1, time: string = '0:0') {
    this.dailyAt(time)

    return this.spliceIntoPosition(3, dayOfMonth).spliceIntoPosition(4, month)
  }

  public everySecond() {
    return this.spliceIntoPosition(0, '*')
  }

  public everySeconds(second: Range<1, 59>) {
    return this.spliceIntoPosition(0, `*/${second}`)
  }

  public everyFiveSeconds() {
    return this.everySeconds(5)
  }

  public everyTenSeconds() {
    return this.everySeconds(10)
  }

  public everyFifteenSeconds() {
    return this.everySeconds(15)
  }

  public everyThirtySeconds() {
    return this.everySeconds(30)
  }

  public cron(expression: string) {
    this.expression = expression

    return this
  }

  protected spliceIntoPosition(position: number, value: string | number) {
    const segements = this.expression.split(' ')

    segements[position] = String(value)

    this.cron(segements.join(' '))

    return this
  }

  protected hourBasedSchedule(
    minutes: string | number | Range<0, 59>[],
    hours: string | number | Range<0, 59>[]
  ) {
    minutes = Array.isArray(minutes) ? minutes.join(',') : minutes
    hours = Array.isArray(hours) ? hours.join(',') : hours

    return this.spliceIntoPosition(1, minutes).spliceIntoPosition(2, hours)
  }

  public days(days: string | number | string[] | number[] | any[]) {
    return this.spliceIntoPosition(5, Array.isArray(days) ? days.join(',') : days)
  }

  public at(time: string) {
    return this.dailyAt(time)
  }

  public dailyAt(time: string) {
    let segments = time.split(':')

    return this.hourBasedSchedule(
      segments.length === 2 ? Number(segments[1]) : '0',
      Number(segments[0])
    )
  }

  public twiceDailyAt(first: Range<0, 23> = 1, second: Range<0, 23> = 13, offset = 0) {
    const hours = first + ',' + second

    return this.hourBasedSchedule(offset, hours)
  }

  public twiceDaily(first: Range<0, 23> = 1, second: Range<0, 23> = 13) {
    return this.twiceDailyAt(first, second, 0)
  }

  public twiceMonthly(first: Range<1, 31> = 1, second: Range<1, 31> = 13, time: string = '0:0') {
    const dayOfMonth = first + ',' + second

    this.dailyAt(time)

    return this.spliceIntoPosition(3, dayOfMonth)
  }

  public lastDayOfMonth(time: string = '0:0') {
    this.dailyAt(time)

    return this.spliceIntoPosition(3, DateTime.now().endOf('month').day)
  }

  public monthlyOn(dayOfMonth: Range<1, 31> = 1, time: string = '0:0') {
    this.dailyAt(time)

    return this.spliceIntoPosition(3, dayOfMonth)
  }

  public getExpression() {
    return this.expression
  }
}

export class ScheduleCommand extends BaseSchedule {
  type: 'command' = 'command'

  commandName: string
  commandArgs: string[]

  constructor(commandName: string, commandArgs: string[] = []) {
    super()

    this.commandName = commandName
    this.commandArgs = commandArgs
  }
}

export class ScheduleCallback extends BaseSchedule {
  type: 'callback' = 'callback'

  callback: Function

  constructor(callback: Function) {
    super()

    this.callback = callback
  }
}

export class Scheduler {
  constructor(protected app: ApplicationService) {
    this.app = app
  }

  static __decorator_schedules: (ScheduleCallback | ScheduleCommand)[] = []

  items: (ScheduleCallback | ScheduleCommand)[] = []

  onStartingCallback?: () => void | Promise<void>
  onStartedCallback?: () => void | Promise<void>

  public async boot() {
    const fsLoader = new FsLoader<typeof BaseCommand>(this.app.commandsPath())
    await fsLoader.getMetaData()

    for (const command of this.app.rcFile.commands) {
      const loader = await (typeof command === 'function' ? command() : command)
      await loader.getMetaData()
    }

    if (!Scheduler.__decorator_schedules || Scheduler.__decorator_schedules.length === 0) return

    this.items.push(...Scheduler.__decorator_schedules)
  }

  public command(name: string | typeof BaseCommand, args: string | string[] = []) {
    let newCommand = new ScheduleCommand(
      typeof name === 'string' ? name : name.commandName,
      arrayWrap(args)
    )

    this.items.push(newCommand)

    return newCommand
  }

  public call(callback: Function) {
    let newCommand = new ScheduleCallback(callback)

    this.items.push(newCommand)

    return newCommand
  }

  public withoutOverlapping(callback: () => void, config = { expiresAt: 3600000 }) {
    const lastLength = this.items.length
    callback()
    const currentLength = this.items.length

    const newItems = this.items.slice(lastLength, currentLength)

    for (const item of newItems) {
      item.withoutOverlapping(config.expiresAt)
    }
  }

  public onStarting(callback: () => void | Promise<void>) {
    this.onStartingCallback = callback
  }

  public onStarted(callback: () => void | Promise<void>) {
    this.onStartedCallback = callback
  }
}
