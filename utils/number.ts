export function numberWithSpaces(value: number) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
