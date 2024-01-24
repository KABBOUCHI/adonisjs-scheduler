import type { Scheduler } from '../src/scheduler.js'
import app from '@adonisjs/core/services/app'

let scheduler: Scheduler

await app.booted(async () => {
    scheduler = await app.container.make("scheduler")
})

export { scheduler as default }