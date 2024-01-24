/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: ConfigureCommand) {
    const codemods = await command.createCodemods()

    await codemods.makeUsingStub(stubsRoot, 'start/scheduler.stub', {})


    await codemods.updateRcFile((rcFile: any) => {
        rcFile.addProvider('adonisjs-scheduler/scheduler_provider', ['console'])
        rcFile.addCommand('adonisjs-scheduler/commands')
        rcFile.addPreloadFile('#start/scheduler', ['console'])
    })
}