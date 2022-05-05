import { Context, Telegraf } from 'telegraf';

enum Command {
    Help = 'help',
    List = 'list',
    Add = 'add',
}

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
        this.bot.start((ctx) => {
            const username = ctx.message.from.first_name || ctx.message.from.username;
            ctx.reply(`Привет, ${username}. ` + this.getHelpMessage(), {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            });
        });
        this.bot.help((ctx) =>
            ctx.reply(this.getHelpMessage(), { parse_mode: 'Markdown', disable_web_page_preview: true }),
        );

        this.bot.command(Command.List, (ctx) => this.replySubscribesList(ctx));
        this.bot.action(Command.List, (ctx) => {
            ctx.deleteMessage();
            this.replySubscribesList(ctx);
        });
        this.bot.action(/^remove subscribe[0-9]+$/, (ctx) => {
            ctx.deleteMessage();
            this.replySubscribesList(ctx);
            ctx.reply(`Подписка ${ctx.callbackQuery.data} успешно удалена!`);
        });
        this.bot.action(/^subscribe[0-9]+$/, (ctx) => {
            ctx.deleteMessage();
            ctx.reply(`Действия с подпиской ${ctx.callbackQuery.data}:`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔙 Назад', callback_data: Command.List },
                            { text: '🗑 Удалить', callback_data: `remove ${ctx.callbackQuery.data}` },
                        ],
                    ],
                },
                parse_mode: 'Markdown',
            });
        });
    }

    private getHelpMessage(): string {
        return `Я бот для мониторинга цен в магазине [store77](https://store77.net/) по определенным товарам. Я буду уведомлять тебя, когда цена на определенный товар изменилась.

🔼 - цена на товар повысилась
🔽 - цена на товар снизилась

*Список доступных команд:*
/${Command.Help} - помощь
/${Command.List} - список отслеживаемых товаров
/${Command.Add} - добавить новый товар для отслеживания
`;
    }

    private replySubscribesList(ctx: Context) {
        // TODO: empty list
        ctx.reply('Список текущих подписок:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Подписка 1', callback_data: 'subscribe1' },
                        { text: 'Подписка 2', callback_data: 'subscribe2' },
                        { text: 'Подписка 3', callback_data: 'subscribe3' },
                        { text: 'Подписка 4', callback_data: 'subscribe4' },
                    ],
                ],
            },
            parse_mode: 'Markdown',
        });
    }
}
