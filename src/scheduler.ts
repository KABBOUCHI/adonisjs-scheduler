class ScheduleCommand {
    commandName: string;
    commandArgs: string[];
    expression: string = "* * * * *";

    constructor(commandName: string, commandArgs: string[] = []) {
        this.commandName = commandName;
        this.commandArgs = commandArgs;
    }

    public everyMinute() {
        this.expression = "* * * * *"

        return this;
    }

      public cron(expression: string)
      {
          this.expression = expression;
  
          return this;
      }
}

export class Scheduler {
    commands : ScheduleCommand[] = []

    public command(name: string, args : string[] =[]) {

        let newCommand = new ScheduleCommand(name, args);
        
        this.commands.push(newCommand)

        return newCommand
    }
}