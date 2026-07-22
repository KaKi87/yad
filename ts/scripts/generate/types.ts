/** Intermediate representation for options parsed from yad.1. */

export type ValueKind =
    | 'boolean'
    | 'string'
    | 'number'
    | 'optionalString';

export type StructuredKind =
    | 'buttons'
    | 'fields'
    | 'columns'
    | 'tabs'
    | 'fileFilters'
    | 'mimeFilters'
    | 'imageFilters'
    | 'bars'
    | 'marks'
    | 'wkProps'
    | 'imagePaths'
    | 'positional'
    | 'skip';

export type OptionDef = {
    /** Canonical long flag without leading dashes, e.g. `title`. */
    flag: string;
    /** Additional long flags that alias this option. */
    aliases: string[];
    /** camelCase JS property name. */
    key: string;
    /** Logical group id (`common`, `form`, `list`, …). */
    group: string;
    valueKind: ValueKind;
    placeholder?: string;
    repeatable: boolean;
    deprecated: boolean;
    enumValues?: string[];
    defaultValue?: string;
    buildGate?: string;
    description: string;
    /** When set, codegen skips scalar emit and uses a hand-written overlay. */
    structured?: StructuredKind;
};

export type DialogModeDef = {
    /** Mode id used in the API (`form`, `text-info`, `message`, …). */
    id: string;
    /** CLI flag including dashes, or `null` for the default message dialog. */
    flag: string | null;
    /** Method name on createYad (`textInfo` for `text-info`). */
    method: string;
};

export type StockItem = {
    id: string;
    label: string;
    icon: string;
};

export type ExitStatus = {
    code: number;
    description: string;
};

export type Catalog = {
    modes: DialogModeDef[];
    options: OptionDef[];
    stockItems: StockItem[];
    exitStatuses: ExitStatus[];
};
