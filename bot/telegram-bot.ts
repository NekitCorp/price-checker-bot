import { Telegraf } from 'telegraf';
import { actions, commands } from './handlers';

export class TelegramBot {
    private readonly bot: Telegraf;

    constructor(token: string) {
        this.bot = new Telegraf(token);
        this.registerMiddlewares();
        this.registerHandlers();
    }

    public launch() {
        this.bot.launch().then(() => console.log(`Telegram bot ${this.bot.botInfo?.first_name} is running.`));
    }

    public stop(reason?: string) {
        console.log(`Telegram bot ${this.bot.botInfo?.first_name} stops...`);
        this.bot.stop(reason);
        console.log(`Telegram bot ${this.bot.botInfo?.first_name} stopped.`);
    }

    private registerMiddlewares() {
        this.bot.use(async (ctx, next) => {
            console.log(ctx.update);
            console.time(`Processing update ${ctx.update.update_id}`);
            await next();
            console.timeEnd(`Processing update ${ctx.update.update_id}`);
        });
    }

    private registerHandlers() {
        // register commands
        Object.entries(commands).forEach(([command, handler]) => this.bot.command(command, handler));

        // register actions
        Object.values(actions).forEach(({ trigger, handler }) => this.bot.action(trigger, handler));
    }
}
