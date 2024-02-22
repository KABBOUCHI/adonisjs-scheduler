import { BaseCommand } from "@adonisjs/core/ace";
import { everyHour, everyMinute, every } from "node-cron-expression"

abstract class BaseSchedule {
    abstract type: string;
    expression: string = "* * * * *";
    config = {
        enabled: true,
        immediate: false,
        withoutOverlapping: false,
        expiresAt: 3600000
    }

    public skip(state: boolean = true) {
        this.config.enabled = !state

        return this;
    }

    public immediate(state: boolean = true) {
        this.config.immediate = state

        return this;
    }

    public withoutOverlapping(expiresAt: number = 3600000) {
        this.config.withoutOverlapping = true
        this.config.expiresAt = expiresAt;

        return this;
    }

    public everyMinutes(minutes: number) {
        this.expression = every(minutes).minutes().toString()

        return this;
    }

    public everyMinute() {
        this.expression = everyMinute().toString()

        return this;
    }

    public everyTwoMinutes() {
        return this.everyMinutes(2)
    }

    public everyThreeMinutes() {
        return this.everyMinutes(3)
    }

    public everyFourMinutes() {
        return this.everyMinutes(4)
    }

    public everyFiveMinutes() {
        return this.everyMinutes(5)
    }

    public everyTenMinutes() {
        return this.everyMinutes(10)
    }

    public everyFifteenMinutes() {
        return this.everyMinutes(15)
    }

    public everyThirtyMinutes() {
        return this.everyMinutes(30)
    }

    public hourly() {
        this.expression = everyHour().toString()

        return this;
    }

    public everyHours(hours: number) {
        this.expression = every(hours).hours().toString()

        return this;
    }

    public everyTwoHours() {
        return this.everyHours(2);
    }

    public everyThreeHours() {
        return this.everyHours(3);
    }

    public everyFourHours() {
        return this.everyHours(5);
    }

    public everyFiveHours() {
        return this.everyHours(6);
    }

    public everySixHours() {
        return this.everyHours(6);
    }

    public daily() {
        this.expression = '0 0 * * *'

        return this;
    }

    public weekly() {
        this.expression = '0 0 * * 0'

        return this;
    }

    public monthly() {
        this.expression = '0 0 1 * *'

        return this;
    }

    public quarterly() {
        this.expression = '0 0 1 */3 *'

        return this;
    }


    public yearly() {
        this.expression = '0 0 1 1 *'

        return this;
    }

    public everySecond() {
        this.expression = "* * * * * *"

        return this;
    }

    public everySeconds(second: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59) {
        this.expression = `*/${second} * * * * *`

        return this;
    }

    public everyFiveSeconds() {
        return this.everySeconds(5);
    }

    public everyTenSeconds() {
        return this.everySeconds(10);
    }

    public everyFifteenSeconds() {
        return this.everySeconds(15);
    }

    public everyThirtySeconds() {
        return this.everySeconds(30);
    }

    public cron(expression: string) {
        this.expression = expression;

        return this;
    }
}

class ScheduleCommand extends BaseSchedule {
    type: "command" = "command";

    commandName: string;
    commandArgs: string[];

    constructor(commandName: string, commandArgs: string[] = []) {
        super();

        this.commandName = commandName;
        this.commandArgs = commandArgs;
    }
}

class ScheduleCallback extends BaseSchedule {
    type: "callback" = "callback";

    callback: Function;

    constructor(callback: Function) {
        super();

        this.callback = callback;
    }
}

export class Scheduler {
    items: (ScheduleCallback | ScheduleCommand)[] = []

    onStartingCallback?: () => void|Promise<void>;
    onStartedCallback?: () => void|Promise<void>;

    public command(name: string | typeof BaseCommand, args: string[] = []) {

        let newCommand = new ScheduleCommand(typeof name === "string" ? name : name.commandName, args);

        this.items.push(newCommand)

        return newCommand
    }

    public call(callback: Function) {

        let newCommand = new ScheduleCallback(callback);

        this.items.push(newCommand)

        return newCommand
    }

    public withoutOverlapping(callback: () => void, config = { expiresAt: 3600000 }) {
        const lastLength = this.items.length
        callback()
        const currentLength = this.items.length

        const newItems = this.items.slice(lastLength, currentLength);

        for (const item of newItems) {
            item.withoutOverlapping(config.expiresAt)
        }
    }

    public onStarting(callback: () => void|Promise<void>) {
        this.onStartingCallback = callback
    }

    public onStarted(callback: () => void|Promise<void>) {
        this.onStartedCallback = callback
    }
}