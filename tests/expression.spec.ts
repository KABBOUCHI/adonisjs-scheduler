import { test } from '@japa/runner'
import { BaseSchedule } from '../src/scheduler.js'
import { DateTime } from 'luxon'

class TestSchedule extends BaseSchedule {
  type: string = 'test'
}

const schedule = () => new TestSchedule()

test.group('Expression', () => {
  test('every second', ({ assert }) => {
    assert.equal('* * * * * *', schedule().everySecond().getExpression())
  })

  test('every x seconds', ({ assert }) => {
    assert.equal('*/5 * * * * *', schedule().everyFiveSeconds().getExpression())
    assert.equal('*/10 * * * * *', schedule().everyTenSeconds().getExpression())
    assert.equal('*/15 * * * * *', schedule().everyFifteenSeconds().getExpression())
    assert.equal('*/42 * * * * *', schedule().everySeconds(42).getExpression())
  })

  test('every minute', ({ assert }) => {
    assert.equal('0 * * * * *', schedule().getExpression())
    assert.equal('0 * * * * *', schedule().everyMinute().getExpression())
  })

  test('every x minutes', ({ assert }) => {
    assert.equal('0 */2 * * * *', schedule().everyTwoMinutes().getExpression())
    assert.equal('0 */3 * * * *', schedule().everyThreeMinutes().getExpression())
    assert.equal('0 */5 * * * *', schedule().everyFiveMinutes().getExpression())
    assert.equal('0 */10 * * * *', schedule().everyTenMinutes().getExpression())
    assert.equal('0 */15 * * * *', schedule().everyFifteenMinutes().getExpression())
    assert.equal('0 */42 * * * *', schedule().everyMinutes(42).getExpression())
  })

  test('daily', ({ assert }) => {
    assert.equal('0 0 0 * * *', schedule().daily().getExpression())
  })

  test('daily at', ({ assert }) => {
    assert.equal('0 8 13 * * *', schedule().dailyAt('13:08').getExpression())
  })

  test('twice daily', ({ assert }) => {
    assert.equal('0 0 3,15 * * *', schedule().twiceDaily(3, 15).getExpression())
  })

  test('twice daily at', ({ assert }) => {
    assert.equal('0 5 3,15 * * *', schedule().twiceDailyAt(3, 15, 5).getExpression())
  })

  test('weekly', ({ assert }) => {
    assert.equal('0 0 0 * * 0', schedule().weekly().getExpression())
  })

  test('weekly on', ({ assert }) => {
    assert.equal('0 0 8 * * 1', schedule().weeklyOn(1, '8:00').getExpression())
  })

  test('override with hourly', ({ assert }) => {
    assert.equal('0 0 * * * *', schedule().everyFiveMinutes().hourly().getExpression())
    assert.equal('0 37 * * * *', schedule().hourlyAt(37).getExpression())
    assert.equal('0 */10 * * * *', schedule().hourlyAt('*/10').getExpression())
    assert.equal('0 15,30,45 * * * *', schedule().hourlyAt([15, 30, 45]).getExpression())
  })

  test('hourly', ({ assert }) => {
    assert.equal('0 0 1-23/2 * * *', schedule().everyOddHour().getExpression())
    assert.equal('0 0 */2 * * *', schedule().everyTwoHours().getExpression())
    assert.equal('0 0 */3 * * *', schedule().everyThreeHours().getExpression())
    assert.equal('0 0 */4 * * *', schedule().everyFourHours().getExpression())
    assert.equal('0 0 */6 * * *', schedule().everySixHours().getExpression())

    assert.equal('0 37 1-23/2 * * *', schedule().everyOddHour(37).getExpression())
    assert.equal('0 37 */2 * * *', schedule().everyTwoHours(37).getExpression())
    assert.equal('0 37 */3 * * *', schedule().everyThreeHours(37).getExpression())
    assert.equal('0 37 */4 * * *', schedule().everyFourHours(37).getExpression())
    assert.equal('0 37 */6 * * *', schedule().everySixHours(37).getExpression())

    assert.equal('0 */10 1-23/2 * * *', schedule().everyOddHour('*/10').getExpression())
    assert.equal('0 */10 */2 * * *', schedule().everyTwoHours('*/10').getExpression())
    assert.equal('0 */10 */3 * * *', schedule().everyThreeHours('*/10').getExpression())
    assert.equal('0 */10 */4 * * *', schedule().everyFourHours('*/10').getExpression())
    assert.equal('0 */10 */6 * * *', schedule().everySixHours('*/10').getExpression())

    assert.equal('0 15,30,45 1-23/2 * * *', schedule().everyOddHour([15, 30, 45]).getExpression())
    assert.equal('0 15,30,45 */2 * * *', schedule().everyTwoHours([15, 30, 45]).getExpression())
    assert.equal('0 15,30,45 */3 * * *', schedule().everyThreeHours([15, 30, 45]).getExpression())
    assert.equal('0 15,30,45 */4 * * *', schedule().everyFourHours([15, 30, 45]).getExpression())
    assert.equal('0 15,30,45 */6 * * *', schedule().everySixHours([15, 30, 45]).getExpression())
  })

  test('monthly', ({ assert }) => {
    assert.equal('0 0 0 1 * *', schedule().monthly().getExpression())
  })

  test('monthly on', ({ assert }) => {
    assert.equal('0 0 15 4 * *', schedule().monthlyOn(4, '15:00').getExpression())
  })

  test('LastDayOfMonth', ({ assert }) => {
    const lastDayOfMonth = DateTime.now().endOf('month').day

    assert.equal(`0 0 0 ${lastDayOfMonth} * *`, schedule().lastDayOfMonth().getExpression())
  })

  test('twice monthly', ({ assert }) => {
    assert.equal('0 0 0 1,16 * *', schedule().twiceMonthly(1, 16).getExpression())
  })

  test('twice monthlyAtTime', ({ assert }) => {
    assert.equal('0 30 1 1,16 * *', schedule().twiceMonthly(1, 16, '1:30').getExpression())
  })

  test('monthly on with minutes', ({ assert }) => {
    assert.equal('0 15 15 4 * *', schedule().monthlyOn(4, '15:15').getExpression())
  })

  test('weekdays daily', ({ assert }) => {
    assert.equal('0 0 0 * * 1-5', schedule().weekdays().daily().getExpression())
  })

  test('weekdays hourly', ({ assert }) => {
    assert.equal('0 0 * * * 1-5', schedule().weekdays().hourly().getExpression())
  })
  test('weekdays', ({ assert }) => {
    assert.equal('0 * * * * 1-5', schedule().weekdays().getExpression())
  })

  test('weekends', ({ assert }) => {
    assert.equal('0 * * * * 6,0', schedule().weekends().getExpression())
  })

  test('sundays', ({ assert }) => {
    assert.equal('0 * * * * 0', schedule().sundays().getExpression())
  })

  test('mondays', ({ assert }) => {
    assert.equal('0 * * * * 1', schedule().mondays().getExpression())
  })

  test('tuesdays', ({ assert }) => {
    assert.equal('0 * * * * 2', schedule().tuesdays().getExpression())
  })

  test('wednesdays', ({ assert }) => {
    assert.equal('0 * * * * 3', schedule().wednesdays().getExpression())
  })

  test('thursdays', ({ assert }) => {
    assert.equal('0 * * * * 4', schedule().thursdays().getExpression())
  })
  test('fridays', ({ assert }) => {
    assert.equal('0 * * * * 5', schedule().fridays().getExpression())
  })

  test('saturdays', ({ assert }) => {
    assert.equal('0 * * * * 6', schedule().saturdays().getExpression())
  })

  test('quarterly', ({ assert }) => {
    assert.equal('0 0 0 1 1-12/3 *', schedule().quarterly().getExpression())
  })
  test('yearly', ({ assert }) => {
    assert.equal('0 0 0 1 1 *', schedule().yearly().getExpression())
  })

  test('yearly on', ({ assert }) => {
    assert.equal('0 8 15 5 4 *', schedule().yearlyOn(4, 5, '15:08').getExpression())
  })

  test('yearly on and mondays only', ({ assert }) => {
    assert.equal('0 1 9 * 7 1', schedule().mondays().yearlyOn(7, '*', '09:01').getExpression())
  })

  test('yearly on tuesdays And DayOfMonth 20', ({ assert }) => {
    assert.equal('0 1 9 20 7 2', schedule().tuesdays().yearlyOn(7, 20, '09:01').getExpression())
  })
})
