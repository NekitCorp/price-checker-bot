export function escapeMessage(text: string): string {
    return (
        text
            // Bad Request: can't parse entities: Character '(' is reserved and must be escaped with the preceding '\\'
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            // Bad Request: can't parse entities: Character '-' is reserved and must be escaped with the preceding '\\'
            .replace(/-/g, '\\-')
    );
}
