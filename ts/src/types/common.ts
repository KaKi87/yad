import type { StockButtonId } from './exit-codes.ts';

export type WindowType =
    | 'normal'
    | 'dialog'
    | 'utility'
    | 'dock'
    | 'desktop'
    | 'tooltip'
    | 'notification'
    | 'splash';

export type TextAlign = 'left' | 'right' | 'center' | 'fill';
export type ScrollPolicy = 'auto' | 'always' | 'never';
export type ButtonsLayout = 'spread' | 'edge' | 'start' | 'end' | 'center';
export type BoolFormat = 'T' | 't' | 'Y' | 'y' | 'O' | 'o' | '1';
export type TimeoutIndicator = 'top' | 'bottom' | 'left' | 'right';

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

/** Options shared across most dialog types (yad.1 General options). */
export type CommonOptions = {
    title?: string;
    windowIcon?: string;
    width?: number;
    height?: number;
    posX?: number;
    posY?: number;
    geometry?: string;
    borders?: number;
    sticky?: boolean;
    fixed?: boolean;
    center?: boolean;
    mouse?: boolean;
    onTop?: boolean;
    undecorated?: boolean;
    skipTaskbar?: boolean;
    maximized?: boolean;
    fullscreen?: boolean;
    windowType?: WindowType;
    noFocus?: boolean;
    closeOnUnfocus?: boolean;
    text?: string;
    textWidth?: number;
    textAlign?: TextAlign;
    image?: string;
    iconTheme?: string;
    keepIconSize?: boolean;
    imagePaths?: string[];
    expander?: string | boolean;
    noMarkup?: boolean;
    selectableLabels?: boolean;
    hscrollPolicy?: ScrollPolicy;
    vscrollPolicy?: ScrollPolicy;
    buttons?: YadButton[];
    noButtons?: boolean;
    buttonsLayout?: ButtonsLayout;
    noEscape?: boolean;
    escapeOk?: boolean;
    response?: number;
    alwaysPrintResult?: boolean;
    timeout?: number;
    timeoutIndicator?: TimeoutIndicator;
    killParent?: string | boolean;
    plug?: number;
    tabNum?: number;
    useInterp?: string | boolean;
    uriHandler?: string;
    f1Action?: string;
    workdir?: string;
    css?: string;
    rest?: string;
    printXid?: string | boolean;
    enableSpell?: boolean;
    spellLang?: string;
    boolFmt?: BoolFormat;
    fileFilters?: FileFilter[];
    mimeFilters?: MimeFilter[];
    imageFilters?: (string | boolean)[];
    addPreview?: boolean;
    largePreview?: boolean;
};

export type CreateYadOptions = {
    path?: string;
};
