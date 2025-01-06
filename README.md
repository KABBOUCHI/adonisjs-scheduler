<div align="center">
  <h1><b>AdonisJS Scheduler</b></h1>

  <p>Task scheduler for AdonisJS v6</p>

  <p>
    <a href="https://npmjs.org/package/adonisjs-scheduler" target="_blank">
      <img alt="npm" src="https://img.shields.io/npm/v/adonisjs-scheduler.svg?style=for-the-badge&logo=npm" />
    </a>
    <a href="https://github.com/KABBOUCHI/adonisjs-scheduler/blob/master/LICENSE.md" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/npm/l/adonisjs-scheduler?color=blueviolet&style=for-the-badge" />
    </a>
    <img alt="Typescript" src="https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript" />
  </p>
</div>

<p align="center">
    <img src="https://raw.githubusercontent.com/KABBOUCHI/adonisjs-scheduler/master/example.png" alt="Scheduler code example">
</p>

<aside class="notice">
  <a href="https://github.com/KABBOUCHI/adonisjs-scheduler/tree/0.x">For AdonisJS v5 use 0.x branch</a>
</aside>

## Installation

Install the package from npm using the following command:

```bash
node ace add adonisjs-scheduler
```

## Running The Scheduler

```sh
node ace scheduler:run
# or
node ace scheduler:work

# automatically restart the scheduler when files are modified during development mode
node ace scheduler:run --watch
```

## Defining Schedules

```ts
// start/scheduler.ts

import scheduler from 'adonisjs-scheduler/services/main'

import PurgeUsers from '../commands/purge_users'

scheduler.command('inspire').everyFiveSeconds()
scheduler.command(PurgeUsers, ['30 days']).everyFiveSeconds().withoutOverlapping()

scheduler.withoutOverlapping(
  () => {
    scheduler.command('inspire').everySecond()
    scheduler.command(PurgeUsers, ['30 days']).everyFiveSeconds()
  },
  { expiresAt: 30_000 }
)

scheduler
  .call(() => {
    console.log('Pruge DB!')
  })
  .weekly()
```

## Schedule Frequency Options

| Method                           | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `.cron('* * * * *');`            | Run the task on a custom cron schedule                  |
| `.everyMinute();`                | Run the task every minute                               |
| `.everyTwoMinutes();`            | Run the task every two minutes                          |
| `.everyThreeMinutes();`          | Run the task every three minutes                        |
| `.everyFourMinutes();`           | Run the task every four minutes                         |
| `.everyFiveMinutes();`           | Run the task every five minutes                         |
| `.everyTenMinutes();`            | Run the task every ten minutes                          |
| `.everyFifteenMinutes();`        | Run the task every fifteen minutes                      |
| `.everyThirtyMinutes();`         | Run the task every thirty minutes                       |
| `.hourly();`                     | Run the task every hour                                 |
| `.hourlyAt(17);`                 | Run the task every hour at 17 minutes past the hour.    |
| `.everyTwoHours();`              | Run the task every two hours                            |
| `.everyThreeHours();`            | Run the task every three hours                          |
| `.everyFourHours();`             | Run the task every four hours                           |
| `.everyFiveHours();`             | Run the task every five hours                           |
| `.everySixHours();`              | Run the task every six hours                            |
| `.daily();`                      | Run the task every day at midnight                      |
| `.dailyAt('13:00');`             | Run the task every day at 13:00.                        |
| `.twiceDaily(1, 13);`            | Run the task daily at 1:00 & 13:00.                     |
| `.twiceDailyAt(1, 13, 15);`      | Run the task daily at 1:15 & 13:15.                     |
| `.weekly();`                     | Run the task every Sunday at 00:00                      |
| `.weeklyOn(1, '8:00');`          | Run the task every week on Monday at 8:00.              |
| `.monthly();`                    | Run the task on the first day of every month at 00:00   |
| `.monthlyOn(4, '15:00');`        | Run the task every month on the 4th at 15:00.           |
| `.twiceMonthly(1, 16, '13:00');` | Run the task monthly on the 1st and 16th at 13:00.      |
| `.lastDayOfMonth('15:00');`      | Run the task on the last day of the month at 15:00.     |
| `.quarterly();`                  | Run the task on the first day of every quarter at 00:00.|
| `.quarterlyOn(4, '14:00');`      | Run the task every quarter on the 4th at 14:00.         |
| `.yearly();`                     | Run the task on the first day of every year at 00:00.   |
| `.yearlyOn(6, 1, '17:00');`      | Run the task every year on June 1st at 17:00.           |
| `.timezone('America/New_York');` | Set the timezone for the task.                          |
| `.immediate();`                  | Run the task on startup                                 |
| `.withoutOverlapping();`         | Run the task without overlapping                        |
