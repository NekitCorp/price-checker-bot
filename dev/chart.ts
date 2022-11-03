/* eslint-disable no-console */
import fs from 'fs/promises';
import { Chart } from '../src/modules/chart';
import { IChartData } from '../src/modules/chart/types';

const chart = new Chart();
const data: IChartData = [
    { x: 'Red', y: 12 },
    { x: 'Blue', y: 19 },
    { x: 'Yellow', y: 3 },
    { x: 'Green', y: 5 },
    { x: 'Purple', y: 2 },
    { x: 'Orange', y: 3 },
];

async function main() {
    const source = await chart.render(data);
    await fs.writeFile('chart.png', source);

    process.exit();
}

main();
