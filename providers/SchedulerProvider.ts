import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Scheduler } from '../src/scheduler'


export default class SchedulerProvider {
  constructor(protected app: ApplicationContract) { }

  public boot() {
    this.app.container.singleton("Adonis/Addons/Scheduler", () => {
      return new Scheduler()
    })
  }
}
