import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export type IChartData = { x: string; y: number }[];

export class Chart {
    private readonly canvas: ChartJSNodeCanvas;

    constructor(width = 1000, height = 400) {
        this.canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
    }

    public async render(data: IChartData): Promise<Buffer> {
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
