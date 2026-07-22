import type {
    Catalog,
    OptionDef
} from './types.ts';
import {
    GENERATED_HEADER,
    quote,
    joinLines
} from './emit-helpers.ts';
import { resolveMethodName } from './mode-policy.ts';

export const
    emitOptions = (catalog: Catalog): string => {
        const
            common = catalog.options.filter(o => o.group === 'common'),
            lines: string[] = [GENERATED_HEADER];

        lines.push(`export type DialogMode =`);
        for(const mode of catalog.modes)
            lines.push(`    | ${quote(mode.id)}`);
        lines.push(`;\n`);

        lines.push(`export type ModeFlagMap = {`);
        for(const mode of catalog.modes)
            lines.push(`    ${quote(mode.id)}: ${mode.flag === null ? 'null' : quote(mode.flag)};`);
        lines.push(`};\n`);

        lines.push(`export const MODE_FLAGS: ModeFlagMap = {`);
        for(const mode of catalog.modes)
            lines.push(`    ${quote(mode.id)}: ${mode.flag === null ? 'null' : quote(mode.flag)},`);
        lines.push(`};\n`);

        lines.push(`export const DIALOG_METHODS = {`);
        for(const mode of catalog.modes)
            lines.push(`    ${quote(mode.id)}: ${quote(resolveMethodName(mode))},`);
        lines.push(`} as const;\n`);

        lines.push(`/** General + file-filter/preview options shared by dialogs. */`);
        lines.push(`export type GeneratedCommonOptions = {`);
        lines.push(...emitOptionFields(common));
        lines.push(`};\n`);

        const groups = [...new Set(
            catalog.options
                .map(o => o.group)
                .filter(g => g !== 'common' && g !== 'misc' && g !== '_modes')
        )].sort();

        for(const group of groups){
            const
                opts = catalog.options.filter(o => o.group === group),
                typeName = `${group
                    .split('-')
                    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                    .join('') }GeneratedOptions`;

            lines.push(`export type ${typeName} = {`);
            lines.push(...emitOptionFields(opts));
            lines.push(`};\n`);
        }

        lines.push(`export type GeneratedModeOptions = {`);
        for(const mode of catalog.modes){
            if(mode.id === 'message'){
                lines.push(`    ${quote(mode.id)}: GeneratedCommonOptions;`);
                continue;
            }
            const typeName = `${mode.id
                .split('-')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join('') }GeneratedOptions`;
            lines.push(`    ${quote(mode.id)}: GeneratedCommonOptions & ${typeName};`);
        }
        lines.push(`};\n`);

        return joinLines(lines);
    };

const
    tsTypeFor = (opt: OptionDef): string => {
        if(opt.structured)
            return 'never';

        let base: string;
        if(opt.enumValues && opt.enumValues.length > 0)
            base = opt.enumValues.map(quote).join(' | ');
        else if(opt.valueKind === 'boolean')
            base = 'boolean';
        else if(opt.valueKind === 'number')
            base = 'number';
        else if(opt.valueKind === 'optionalString')
            base = 'string | boolean';
        else
            base = 'string';

        if(opt.repeatable)
            return `${base}[]`;

        return base;
    },

    emitOptionFields = (options: OptionDef[]): string[] => {
        const lines: string[] = [];
        for(const opt of options){
            if(opt.structured)
                continue;
            const
                doc = opt.description
                ? `    /** ${opt.description.replace(/\*\//g, '*\\/')} */\n`
                : '',
                deprecated = opt.deprecated ? '    /** @deprecated */\n' : '';
            lines.push(`${doc}${deprecated}    ${opt.key}?: ${tsTypeFor(opt)};`);
        }
        return lines;
    };
