export const
    GENERATED_HEADER = `/**\n * AUTO-GENERATED from data/yad.1 — do not edit.\n * Regenerate with: bun run generate\n */\n`,

    indent = (level: number, text: string): string =>
        text
            .split('\n')
            .map(line => (line.length === 0 ? line : `${'    '.repeat(level)}${line}`))
            .join('\n'),

    quote = (value: string): string =>
        `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`,

    propKey = (key: string): string =>
        /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : quote(key),

    joinLines = (lines: string[]): string =>
        `${lines.filter((line, i, arr) => !(line === '' && i === arr.length - 1)).join('\n')}\n`;
