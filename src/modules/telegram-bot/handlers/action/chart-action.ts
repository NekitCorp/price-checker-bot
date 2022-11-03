import dayjs from 'dayjs';
import { Price } from '../../../database/entities/price';
import { ProductId } from '../../../database/entities/product';
import { ActionHandler } from '../../types';
import { Action } from '../types';

export const chartActionHandler: ActionHandler = async ({ ctx, services: { db, chart } }) => {
    await ctx.answerCbQuery();

    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }

    const prices = (
        await Price.getLastPrices(db, {
            count: 30,
            productId: data.replace(`${Action.Chart} `, '') as ProductId,
        })
    ).reverse();

    if (prices.length < 10) {
        ctx.reply('💾 Недостаточно данных для построения графика...');
        return;
    }

    const source = await chart.render(prices.map((p) => ({ x: dayjs(p.created).format('DD.MM.YY'), y: p.price })));

    await ctx.replyWithPhoto({ source });
};
