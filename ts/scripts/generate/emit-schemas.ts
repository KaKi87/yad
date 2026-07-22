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
    emitSchemas = (catalog: Catalog): string => {
        const
            common = catalog.options.filter(o => o.group === 'common'),
            lines: string[] = [
                GENERATED_HEADER,
                `import Joi from 'joi';\n`,
                `export const generatedCommonKeys = {`,
                ...emitKeys(common),
                `} as const;\n`,
                `export const generatedCommonSchema = Joi.object({ ...generatedCommonKeys }).unknown(false);\n`
            ],

            groups = [...new Set(
                catalog.options
                    .map(o => o.group)
                    .filter(g => g !== 'common' && g !== 'misc' && g !== '_modes')
            )].sort();

        lines.push(`export const generatedModeKeys = {`);
        for(const group of groups){
            const opts = catalog.options.filter(o => o.group === group);
            lines.push(`    ${quote(group)}: {`);
            lines.push(...emitKeys(opts).map(l => `    ${l}`));
            lines.push(`    },`);
        }
        lines.push(`} as const;\n`);

        lines.push(`export const generatedModeSchemas = {`);
        for(const mode of catalog.modes){
            if(mode.id === 'message'){
                lines.push(`    ${quote(mode.id)}: generatedCommonSchema,`);
                continue;
            }
            lines.push(
                `    ${quote(mode.id)}: generatedCommonSchema.keys(generatedModeKeys[${quote(mode.id)}] ?? {}),`
            );
        }
        lines.push(`} as const;\n`);

        return joinLines(lines);
    };

const
    joiFor = (opt: OptionDef): string => {
        if(opt.structured)
            return 'Joi.any()';

        let schema: string;
        if(opt.enumValues && opt.enumValues.length > 0){
            const vals = opt.enumValues.map(quote).join(', ');
            if(opt.valueKind === 'number')
                schema = `Joi.number().valid(${vals})`;
            else
                schema = `Joi.string().valid(${vals})`;
        }
        else if(opt.valueKind === 'boolean')
            schema = 'Joi.boolean()';
        else if(opt.valueKind === 'number')
            schema = 'Joi.number().integer()';
        else if(opt.valueKind === 'optionalString')
            schema = 'Joi.alternatives().try(Joi.boolean(), Joi.string().allow(\'\'))';
        else
            schema = 'Joi.string().allow(\'\')';

        if(opt.repeatable)
            schema = `Joi.array().items(${schema})`;

        return schema;
    },

    emitKeys = (options: OptionDef[]): string[] => {
        const lines: string[] = [];
        for(const opt of options){
            if(opt.structured)
                continue;
            lines.push(`    ${opt.key}: ${joiFor(opt)},`);
        }
        return lines;
    };
