import type { Scheduler as SchedulerService } from '../src/scheduler.js'
import app from '@adonisjs/core/services/app'

let scheduler: SchedulerService
let resolvedScheduler: SchedulerService | undefined
let pendingCalls: Array<(sched: any) => void> = []

function tryResolveScheduler() {
  return resolvedScheduler
}

async function resolveScheduler() {
  if (resolvedScheduler) return resolvedScheduler
  if (!app) return null
  resolvedScheduler = await Promise.resolve(app.container.make('scheduler'))
  for (const fn of pendingCalls) {
    fn(resolvedScheduler)
  }
  pendingCalls = []
  return resolvedScheduler
}

function createChainProxy(chain: Array<{ method: string | symbol; args: any[] }>) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then' || prop === Symbol.toPrimitive) return undefined
        return (...args: any[]) => {
          chain.push({ method: prop, args })
          return createChainProxy(chain)
        }
      },
    }
  )
}

const proxyHandler: ProxyHandler<any> = {
  get(_target, prop) {
    if (prop === 'then' || prop === Symbol.toPrimitive) return undefined

    const s = tryResolveScheduler()
    if (s) {
      return (s as any)[prop]
    }

    return (...args: any[]) => {
      const chain = [{ method: prop, args }]
      pendingCalls.push((sched) => {
        let result: any = sched
        for (const { method, args: a } of chain) {
          result = result[method](...a)
        }
      })
      return createChainProxy(chain)
    }
  },
}

scheduler = new Proxy({}, proxyHandler) as SchedulerService

resolveScheduler().catch(() => {})

export { scheduler as default }
