export function escapeMessage(text: string): string {
    // Bad Request: can't parse entities: Character '(' is reserved and must be escaped with the preceding '\\'
    return text.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
