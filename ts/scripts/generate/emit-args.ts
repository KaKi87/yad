import type {
    Catalog,
    OptionDef
} from './types.ts';
import {
    GENERATED_HEADER,
    quote,
    joinLines
} from './emit-helpers.ts';

export const
    emitArgs = (catalog: Catalog): string => {
        const
            common = catalog.options.filter(o => o.group === 'common' && !o.structured),
            lines: string[] = [
                GENERATED_HEADER,
                `import type { GeneratedCommonOptions, GeneratedModeOptions, DialogMode } from './options.ts';\n`,
                `export type ArgBuilderHelpers = {`,
                `    pushFlag: (args: string[], flag: string, value?: boolean) => void;`,
                `    pushValue: (args: string[], flag: string, value: string | number | undefined) => void;`,
                `    pushOptional: (args: string[], flag: string, value: string | number | boolean | undefined) => void;`,
                `};\n`,
                `export const pushGeneratedCommonArgs = (`,
                `    args: string[],`,
                `    options: GeneratedCommonOptions,`,
                `    { pushFlag, pushValue, pushOptional }: ArgBuilderHelpers`,
                `): void => {`,
                ...indentBlock(common.flatMap(opt => emitPushLines(opt, 'options')), 1),
                `};\n`,
                `export const pushGeneratedModeArgs = <M extends DialogMode>(`,
                `    args: string[],`,
                `    mode: M,`,
                `    options: GeneratedModeOptions[M],`,
                `    helpers: ArgBuilderHelpers`,
                `): void => {`,
                `    const { pushFlag, pushValue, pushOptional } = helpers;`,
                `    switch(mode){`
            ];

        for(const mode of catalog.modes){
            lines.push(`        case ${quote(mode.id)}: {`);
            if(mode.id === 'message'){
                lines.push(`            break;`);
                lines.push(`        }`);
                continue;
            }

            const opts = catalog.options.filter(o => o.group === mode.id && !o.structured);
            if(opts.length === 0){
                lines.push(`            break;`);
                lines.push(`        }`);
                continue;
            }

            lines.push(`            const modeOptions = options as GeneratedModeOptions[${quote(mode.id)}];`);
            lines.push(...indentBlock(
                opts.flatMap(opt => emitPushLines(opt, 'modeOptions')),
                3
            ));
            lines.push(`            break;`);
            lines.push(`        }`);
        }

        lines.push(`    }`);
        lines.push(`};\n`);

        return joinLines(lines);
    };

const
    emitPushLines = (opt: OptionDef, receiver: string): string[] => {
        const flag = `--${opt.flag}`;
        if(opt.structured)
            return [];

        if(opt.repeatable){
            if(opt.valueKind === 'boolean')
                return [
                    `if(${receiver}.${opt.key})`,
                    `    for(const _ of ${receiver}.${opt.key})`,
                    `        pushFlag(args, ${quote(flag)}, true);`
                ];

            return [
                `if(${receiver}.${opt.key})`,
                `    for(const value of ${receiver}.${opt.key})`,
                `        pushValue(args, ${quote(flag)}, value);`
            ];
        }

        if(opt.valueKind === 'boolean')
            return [`pushFlag(args, ${quote(flag)}, ${receiver}.${opt.key});`];

        if(opt.valueKind === 'optionalString')
            return [`pushOptional(args, ${quote(flag)}, ${receiver}.${opt.key});`];

        return [`pushValue(args, ${quote(flag)}, ${receiver}.${opt.key});`];
    },

    indentBlock = (lines: string[], level: number): string[] =>
        lines.map(line => (line.length === 0 ? line : `${'    '.repeat(level)}${line}`));
