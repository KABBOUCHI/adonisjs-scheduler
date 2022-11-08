abstract class BaseSchedule {
    abstract type: string;
    expression: string = "* * * * *";

    public everyMinute() {
        this.expression = "* * * * *"

        return this;
    }

    public everyFiveSeconds() {
        this.expression = "*/5 * * * * *"

        return this;
    }

    public cron(expression: string) {
        this.expression = expression;

        return this;
    }
}

class ScheduleCommand extends BaseSchedule {
    type: string = "command";

    commandName: string;
    commandArgs: string[];

    constructor(commandName: string, commandArgs: string[] = []) {
        super();

        this.commandName = commandName;
        this.commandArgs = commandArgs;
    }
}

class ScheduleCallback extends BaseSchedule {
    type: string = "callback";

    callback: Function;

    constructor(callback: Function) {
        super();

        this.callback = callback;
    }
}

export class Scheduler {
    commands: BaseSchedule[] = []

    public command(name: string, args: string[] = []) {

        let newCommand = new ScheduleCommand(name, args);

        this.commands.push(newCommand)

        return newCommand
    }

    public callback(callback: Function) {

        let newCommand = new ScheduleCallback(callback);

        this.commands.push(newCommand)

        return newCommand
    }

    public closure(callback: Function) {
        return this.callback(callback);
    }
}