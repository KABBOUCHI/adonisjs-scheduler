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

## Getting Started

This package is available in the npm registry.

```bash
pnpm install adonisjs-scheduler
```

Next, configure the package by running the following command.

```bash
node ace configure adonisjs-scheduler
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
| `.everyTwoHours();`              | Run the task every two hours                            |
| `.everyThreeHours();`            | Run the task every three hours                          |
| `.everyFourHours();`             | Run the task every four hours                           |
| `.everyFiveHours();`             | Run the task every five hours                           |
| `.everySixHours();`              | Run the task every six hours                            |
| `.daily();`                      | Run the task every day at midnight                      |
| `.weekly();`                     | Run the task every Sunday at 00:00                      |
| `.monthly();`                    | Run the task on the first day of every month at 00:00   |
| `.quarterly();`                  | Run the task on the first day of every quarter at 00:00 |
| `.yearly();`                     | Run the task on the first day of every year at 00:00    |
| `.immediate();`                  | Run the task on startup                                 |
| `.withoutOverlapping();`         | Run the task without overlapping                        |
| `.timezone('America/New_York');` | Set the timezone for the task.                          |
