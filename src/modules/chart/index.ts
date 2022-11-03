import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { IChart, IChartData } from './types';

export class Chart implements IChart {
    private readonly canvas: ChartJSNodeCanvas;

    constructor(width = 1000, height = 400) {
        this.canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
    }

    public async render(data: IChartData) {
        return await this.canvas.renderToBuffer({
            type: 'line',
            data: {
                labels: data.map((p) => p.x),
                datasets: [
                    {
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: data.map((p) => p.y),
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
    }
}
