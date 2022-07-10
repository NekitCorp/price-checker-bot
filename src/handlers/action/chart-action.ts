import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import dayjs from 'dayjs';
import { Price } from '../../database/entities/price';
import { ProductId } from '../../database/entities/product';
import { ActionHandler } from '../../telegram-bot/types';
import { Action } from '../types';

const width = 1000; // px
const height = 400; // px
const backgroundColour = 'white'; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

export const chartActionHandler: ActionHandler = async ({ ctx, dbDriver }) => {
    await ctx.answerCbQuery();

    const data = ctx.callbackQuery?.data;
    if (!data) {
        ctx.reply('❌ Ошибка. Не найдены данные callbackQuery.');
        return;
    }

    const prices = (
        await Price.getLastPrices(dbDriver, {
            count: 30,
            productId: data.replace(`${Action.Chart} `, '') as ProductId,
        })
    ).reverse();

    if (prices.length < 10) {
        ctx.reply('💾 Недостаточно данных для построения графика...');
        return;
    }

    const source = await chartJSNodeCanvas.renderToBuffer({
        type: 'line',
        data: {
            labels: prices.map((p) => dayjs(p.created).format('DD.MM.YY')),
            datasets: [
                {
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: prices.map((p) => p.price),
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });

    await ctx.replyWithPhoto({ source });
};
