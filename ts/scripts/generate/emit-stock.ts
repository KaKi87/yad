import type { Catalog } from './types.ts';
import {
    GENERATED_HEADER,
    quote,
    joinLines
} from './emit-helpers.ts';

export const
    emitStock = (catalog: Catalog): string => {
        const lines: string[] = [
            GENERATED_HEADER,
            `export type StockButtonId = typeof StockButton[keyof typeof StockButton];\n`,
            `export type ExitCodeValue = typeof ExitCode[keyof typeof ExitCode];\n`,
            `/** Stock button IDs from yad.1 STOCK ITEMS. */`,
            `export const StockButton = {`
        ];

        for(const item of catalog.stockItems)
            lines.push(`    ${stockKey(item.id)}: ${quote(item.id)},`);

        lines.push(`} as const;\n`);

        lines.push(`/** Documented yad exit codes from yad.1 EXIT STATUS. */`);
        lines.push(`export const ExitCode = {`);
        for(const status of catalog.exitStatuses)
            lines.push(`    ${exitKey(status.description, status.code)}: ${status.code},`);
        lines.push(`} as const;\n`);

        lines.push(`export const STOCK_ITEMS = [`);
        for(const item of catalog.stockItems){
            lines.push(`    {`);
            lines.push(`        id: ${quote(item.id)},`);
            lines.push(`        label: ${quote(item.label)},`);
            lines.push(`        icon: ${quote(item.icon)}`);
            lines.push(`    },`);
        }
        lines.push(`] as const;\n`);

        return joinLines(lines);
    },

    emitCatalogJson = (catalog: Catalog): string =>
        `${JSON.stringify(catalog, null, 4)}\n`;

const
    stockKey = (id: string): string =>
        id.replace(/^yad-/, '').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),

    exitKey = (description: string, code: number): string => {
        const lower = description.toLowerCase();
        if(lower.includes('ok'))
            return 'ok';
        if(lower.includes('cancel'))
            return 'cancel';
        if(lower.includes('timeout'))
            return 'timeout';
        if(lower.includes('esc'))
            return 'escape';
        return `code${code}`;
    };
