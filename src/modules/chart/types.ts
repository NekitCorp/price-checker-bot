export type IChart = {
    render(data: IChartData): Promise<Buffer>;
};

export type IChartData = { x: string; y: number }[];
