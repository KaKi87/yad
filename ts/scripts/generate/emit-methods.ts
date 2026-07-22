import type { Catalog } from './types.ts';
import {
    GENERATED_HEADER,
    quote,
    joinLines,
    propKey
} from './emit-helpers.ts';
import {
    resolvePolicy,
    resolveMethodName
} from './mode-policy.ts';

export const
    emitMethods = (catalog: Catalog): string => {
        const lines: string[] = [
            GENERATED_HEADER,
            `import type { DialogMode, DialogOptionsMap } from '../types/structured.ts';`,
            `import type {`,
            `    ParsedAppResult,`,
            `    ParsedFontResult,`,
            `    ParsedFormResult,`,
            `    ParsedListResult,`,
            `    YadDialogResult,`,
            `    YadProcess,`,
            `    YadRunResult`,
            `} from '../types/results.ts';`,
            `import {`,
            `    parseAppOutput,`,
            `    parseFileOutput,`,
            `    parseFontOutput,`,
            `    parseFormOutput,`,
            `    parseListOutput,`,
            `    parseStdout`,
            `} from '../cli/parse.ts';\n`,
            `export type DialogMethodContext = {`,
            `    getBinary: () => Promise<string>;`,
            `    run: <M extends DialogMode>(`,
            `        mode: M,`,
            `        dialogOptions: DialogOptionsMap[M],`,
            `        extra?: { stdin?: string; positional?: string[] }`,
            `    ) => Promise<YadDialogResult<string>>;`,
            `    spawn: <M extends DialogMode>(`,
            `        mode: M,`,
            `        dialogOptions: DialogOptionsMap[M],`,
            `        extra?: { stdin?: string; positional?: string[] }`,
            `    ) => Promise<YadProcess & { mode: M; options: DialogOptionsMap[M] }>;`,
            `    runDialog: <M extends DialogMode, T>(`,
            `        binary: string,`,
            `        mode: M,`,
            `        options: DialogOptionsMap[M],`,
            `        parse: (stdout: string, result: YadRunResult) => T | null,`,
            `        extra?: { stdin?: string; positional?: string[] }`,
            `    ) => Promise<YadDialogResult<T>>;`,
            `};\n`,
            `export const buildDialogMethods = ({`,
            `    getBinary,`,
            `    run,`,
            `    spawn,`,
            `    runDialog`,
            `}: DialogMethodContext) => ({`
        ];

        for(const mode of catalog.modes){
            const
                policy = resolvePolicy(mode.id),
                method = resolveMethodName(mode),
                modeLit = quote(mode.id),
                optsType = `DialogOptionsMap[${modeLit}]`,
                optsParam = policy.requiredOpts
                    ? `opts: ${optsType}`
                    : `opts: ${optsType} = {}`;

            if(policy.kind === 'spawn'){
                const callOpts = policy.defaults
                    ? `{ ${emitDefaultsInner(policy.defaults)}, ...opts }`
                    : 'opts';
                lines.push(`    ${method}: (${optsParam}) =>`);
                lines.push(`        spawn(${modeLit}, ${callOpts}),`);
                continue;
            }

            if(!policy.parse && !policy.defaults){
                lines.push(`    ${method}: (${optsParam}) =>`);
                lines.push(`        run(${modeLit}, opts),`);
                continue;
            }

            const
                resultType = resultTypeFor(policy.parse),
                parseExpr = emitParseExpr(policy.parse ?? 'stdout'),
                callOpts = policy.defaults
                    ? `{ ${emitDefaultsInner(policy.defaults)}, ...opts }`
                    : 'opts';

            if(policy.parse && policy.parse !== 'stdout'){
                lines.push(`    ${method}: async (${optsParam}): Promise<YadDialogResult<${resultType}>> =>`);
                lines.push(`        runDialog(`);
                lines.push(`            await getBinary(),`);
                lines.push(`            ${modeLit},`);
                lines.push(`            ${callOpts},`);
                lines.push(`            ${parseExpr}`);
                lines.push(`        ),`);
                continue;
            }

            if(policy.parse === 'stdout'){
                lines.push(`    ${method}: async (${optsParam}): Promise<YadDialogResult<string>> =>`);
                lines.push(`        runDialog(await getBinary(), ${modeLit}, ${callOpts}, parseStdout),`);
                continue;
            }

            lines.push(`    ${method}: (${optsParam}) =>`);
            lines.push(`        run(${modeLit}, ${callOpts}),`);
        }

        lines.push(`});\n`);

        return joinLines(lines);
    };

const
    emitDefaultsInner = (defaults: Record<string, unknown>): string =>
        Object.entries(defaults).map(([key, value]) => {
            if(typeof value === 'boolean')
                return `${propKey(key)}: ${value}`;
            if(typeof value === 'number')
                return `${propKey(key)}: ${value}`;
            return `${propKey(key)}: ${quote(String(value))}`;
        }).join(', '),

    emitParseExpr = (parse: string): string => {
        switch(parse){
            case 'app': {
                return `stdout => parseAppOutput(stdout, opts.extended === true)`;
            }
            case 'file': {
                return `stdout => parseFileOutput(stdout, opts.multiple, opts.separator)`;
            }
            case 'font': {
                return `stdout => parseFontOutput(stdout, opts.separateOutput, opts.separator)`;
            }
            case 'form': {
                return `stdout => parseFormOutput(stdout, opts.fields, opts.separator)`;
            }
            case 'list': {
                return `stdout => parseListOutput(stdout, opts.separator)`;
            }
            default: {
                return 'parseStdout';
            }
        }
    },

    resultTypeFor = (parse: string | undefined): string => {
        switch(parse){
            case 'app': {
                return 'ParsedAppResult';
            }
            case 'file': {
                return 'string | string[]';
            }
            case 'font': {
                return 'ParsedFontResult';
            }
            case 'form': {
                return 'ParsedFormResult';
            }
            case 'list': {
                return 'ParsedListResult';
            }
            default: {
                return 'string';
            }
        }
    };
