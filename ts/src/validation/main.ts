import Joi from 'joi';

import type {
    FormField,
    ListColumn,
    NotebookTab,
    YadButton,
    CreateYadOptions,
    DialogMode,
    DialogOptionsMap
} from '../types/structured.ts';
import { generatedModeSchemas } from '../generated/schemas.ts';

export type {
    FormField,
    ListColumn,
    NotebookTab,
    YadButton
};

export const
    validateCreateYadOptions = (options?: CreateYadOptions): CreateYadOptions => {
        const { value, error } = createYadOptionsSchema.validate(options ?? {});
        if(error)
            throw new Error(`Invalid createYad options: ${error.message}`);
        return value;
    },

    validateDialogOptions = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M]
    ): DialogOptionsMap[M] => {
        const
            base = generatedModeSchemas[mode] ?? generatedModeSchemas.message,
            schema = base.keys(structuredKeysFor(mode)),
            { value, error } = schema.validate(options ?? {});

        if(error)
            throw new Error(`Invalid ${mode} options: ${error.message}`);

        return value as DialogOptionsMap[M];
    };

const
    buttonSchema = Joi.object({
        label: Joi.string(),
        icon: Joi.string(),
        tooltip: Joi.string(),
        id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required()
    }),

    fileFilterSchema = Joi.object({
        name: Joi.string().required(),
        patterns: Joi.array().items(Joi.string()).min(1).required()
    }),

    mimeFilterSchema = Joi.object({
        name: Joi.string().required(),
        mimes: Joi.array().items(Joi.string()).min(1).required()
    }),

    formFieldSchema = Joi.object({
        label: Joi.string().required(),
        tooltip: Joi.string(),
        type: Joi.string(),
        value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
    }),

    listColumnSchema = Joi.object({
        name: Joi.string().required(),
        tooltip: Joi.string(),
        type: Joi.string()
    }),

    tabSchema = Joi.object({
        label: Joi.string().required(),
        icon: Joi.string(),
        tooltip: Joi.string()
    }),

    structuredCommonKeys = {
        buttons: Joi.array().items(buttonSchema),
        fileFilters: Joi.array().items(fileFilterSchema),
        mimeFilters: Joi.array().items(mimeFilterSchema),
        imageFilters: Joi.array().items(
            Joi.alternatives().try(Joi.boolean(), Joi.string().allow(''))
        )
    },

    createYadOptionsSchema = Joi.object({
        path: Joi.string()
    }).unknown(false),

    structuredKeysFor = (mode: DialogMode): Record<string, Joi.Schema> => {
        const keys: Record<string, Joi.Schema> = { ...structuredCommonKeys };

        if(mode === 'form'){
            keys.fields = Joi.array().items(formFieldSchema).min(1).required();
            keys.values = Joi.array().items(
                Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
            );
        }

        if(mode === 'list'){
            keys.columns = Joi.array().items(listColumnSchema).min(1).required();
            keys.rows = Joi.array().items(Joi.array().items(Joi.string()));
            keys.treeRows = Joi.array().items(Joi.object({
                id: Joi.string().required(),
                parentId: Joi.string(),
                cells: Joi.array().items(Joi.string()).required()
            }));
        }

        if(mode === 'notebook')
            keys.tabs = Joi.array().items(tabSchema).min(1).required();

        if(mode === 'progress'){
            keys.bars = Joi.array().items(Joi.object({
                label: Joi.string(),
                value: Joi.number()
            }));
            keys.input = Joi.string().allow('');
        }

        if(mode === 'scale')
            keys.marks = Joi.array().items(Joi.object({
                value: Joi.number().required(),
                name: Joi.string()
            }));

        if(mode === 'html')
            keys.wkProps = Joi.array().items(Joi.string());

        if(mode === 'entry'){
            keys.data = Joi.array().items(Joi.string());
            keys.numericRange = Joi.array().items(Joi.number()).max(4);
        }

        if(mode === 'app')
            keys.mimeType = Joi.string();

        if(mode === 'text-info' || mode === 'print')
            keys.input = Joi.string().allow('');

        return keys;
    };
