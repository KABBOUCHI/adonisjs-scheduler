# AdonisJS Scheduler

<p align="center">
    <img src="https://raw.githubusercontent.com/KABBOUCHI/adonisjs-scheduler/master/example.png" alt="Scheduler code example" height="400">
</p>

## Getting Started

This package is available in the npm registry.

```bash
npm install adonisjs-scheduler
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
```

## Defining Schedules
```ts
// start/scheduler.ts

import Scheduler from "@ioc:Adonis/Addons/Scheduler"

Scheduler.command("inspire").everyFiveSeconds();

Scheduler.call(() => {
    console.log("Pruge DB!");
}).weekly();
```

## Schedule Frequency Options

Method  | Description
------------- | -------------
`.cron('* * * * *');`  |  Run the task on a custom cron schedule
`.everyMinute();`  |  Run the task every minute
`.everyTwoMinutes();`  |  Run the task every two minutes
`.everyThreeMinutes();`  |  Run the task every three minutes
`.everyFourMinutes();`  |  Run the task every four minutes
`.everyFiveMinutes();`  |  Run the task every five minutes
`.everyTenMinutes();`  |  Run the task every ten minutes
`.everyFifteenMinutes();`  |  Run the task every fifteen minutes
`.everyThirtyMinutes();`  |  Run the task every thirty minutes
`.hourly();`  |  Run the task every hour
`.everyTwoHours();`  |  Run the task every two hours
`.everyThreeHours();`  |  Run the task every three hours
`.everyFourHours();`  |  Run the task every four hours
`.everyFiveHours();`  |  Run the task every five hours
`.everySixHours();`  |  Run the task every six hours
`.daily();`  |  Run the task every day at midnight
`.weekly();`  |  Run the task every Sunday at 00:00
`.monthly();`  |  Run the task on the first day of every month at 00:00
`.quarterly();` |  Run the task on the first day of every quarter at 00:00
`.yearly();`  |  Run the task on the first day of every year at 00:00

