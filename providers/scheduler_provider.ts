import type { ApplicationService } from '@adonisjs/core/types'
import { Scheduler } from '../src/scheduler.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    scheduler: Scheduler
  }
}

export default class SchedulerProvider {
  constructor(protected app: ApplicationService) {}

  public boot() {
    this.app.container.singleton('scheduler', () => {
      return new Scheduler(this.app)
    })
  }
}
