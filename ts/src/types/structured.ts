import type { StockButtonId } from '../generated/stock.ts';
import type {
    GeneratedCommonOptions,
    GeneratedModeOptions,
    DialogMode
} from '../generated/options.ts';

export type ButtonId = number | string | StockButtonId;

export type YadButton = {
    label?: string;
    icon?: string;
    tooltip?: string;
    id: ButtonId;
};

export type FileFilter = {
    name: string;
    patterns: string[];
};

export type MimeFilter = {
    name: string;
    mimes: string[];
};

export type FormFieldType =
    | 'H' | 'RO' | 'NUM' | 'CHK' | 'CB' | 'CBE' | 'CE'
    | 'FL' | 'SFL' | 'DIR' | 'CDIR' | 'FN' | 'MFL' | 'MDIR'
    | 'DT' | 'SCL' | 'SW' | 'APP' | 'ICON' | 'CLR'
    | 'BTN' | 'FBTN' | 'LINK' | 'LBL' | 'TXT'
    | (string & {});

export type FormField = {
    label: string;
    tooltip?: string;
    type?: FormFieldType;
    value?: string | number | boolean;
};

export type ListColumnType =
    | 'TEXT' | 'NUM' | 'SZ' | 'FLT' | 'CHK' | 'RD' | 'BAR' | 'IMG' | 'HD' | 'TIP'
    | '@fore@' | '@back@' | '@font@'
    | (string & {});

export type ListColumn = {
    name: string;
    tooltip?: string;
    type?: ListColumnType;
};

export type NotebookTab = {
    label: string;
    icon?: string;
    tooltip?: string;
};

export type ProgressBar = {
    label?: string;
    value?: number;
};

export type ScaleMark = {
    value: number;
    name?: string;
};

/** Structured overlays merged onto generated common options. */
export type StructuredCommonOptions = {
    buttons?: YadButton[];
    fileFilters?: FileFilter[];
    mimeFilters?: MimeFilter[];
    imageFilters?: (string | boolean)[];
};

/** Per-mode structured overlays. */
export type StructuredModeOptions = {
    form: { fields: FormField[]; values?: Array<string | number | boolean> };
    list: {
        columns: ListColumn[];
        rows?: string[][];
        treeRows?: Array<{ id: string; parentId?: string; cells: string[] }>;
    };
    notebook: { tabs: NotebookTab[] };
    progress: { bars?: ProgressBar[]; input?: string };
    scale: { marks?: ScaleMark[] };
    html: { wkProps?: string[] };
    entry: { data?: string[]; numericRange?: [number?, number?, number?, number?] };
    app: { mimeType?: string };
    'text-info': { input?: string };
    print: { input?: string };
};

export type CommonOptions = GeneratedCommonOptions & StructuredCommonOptions;

export type DialogOptionsMap = {
    [M in DialogMode]: GeneratedModeOptions[M]
        & StructuredCommonOptions
        & (M extends keyof StructuredModeOptions ? StructuredModeOptions[M] : {});
};

export type CreateYadOptions = {
    /** Path to the yad binary. Defaults to the system-wide `yad` on PATH. */
    path?: string;
};

export type { DialogMode };
