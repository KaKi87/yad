import type {
    CommonOptions,
    TextAlign
} from './common.ts';

export type DialogMode =
    | 'message'
    | 'about'
    | 'app'
    | 'calendar'
    | 'color'
    | 'dnd'
    | 'entry'
    | 'icons'
    | 'file'
    | 'font'
    | 'form'
    | 'html'
    | 'list'
    | 'notebook'
    | 'notification'
    | 'appindicator'
    | 'popup'
    | 'print'
    | 'progress'
    | 'scale'
    | 'text-info'
    | 'paned'
    | 'picture';

export type AboutOptions = CommonOptions & {
    programName?: string;
    programVersion?: string;
    copyright?: string;
    comments?: string;
    license?: string;
    authors?: string;
    website?: string;
    websiteLabel?: string;
};

export type AppOptions = CommonOptions & {
    enableFallback?: boolean;
    enableOther?: boolean;
    enableAll?: boolean;
    extended?: boolean;
    mimeType?: string;
};

export type CalendarOptions = CommonOptions & {
    day?: number;
    month?: number;
    year?: number;
    dateFormat?: string;
    showWeeks?: boolean;
    details?: string;
    selectAction?: string;
};

export type ColorOptions = CommonOptions & {
    initColor?: string;
    gtkPalette?: boolean;
    picker?: boolean;
    alpha?: boolean;
    palette?: string | boolean;
    expandPalette?: boolean;
    mode?: 'hex' | 'rgb';
};

export type DndOptions = CommonOptions & {
    tooltip?: boolean;
    command?: string;
    exitOnDrop?: number;
};

export type EntryOptions = CommonOptions & {
    entryLabel?: string;
    entryText?: string;
    hideText?: boolean;
    completion?: boolean;
    complete?: 'any' | 'all' | 'regex';
    editable?: boolean;
    numeric?: boolean;
    floatPrecision?: number;
    leftIcon?: string;
    leftIconAction?: string;
    rightIcon?: string;
    rightIconAction?: string;
    numOutput?: boolean;
    items?: (string | number)[];
};

export type IconsOptions = CommonOptions & {
    readDir?: string;
    monitor?: boolean;
    generic?: boolean;
    sortByName?: boolean;
    descend?: boolean;
    listen?: boolean;
    itemWidth?: number;
    iconSize?: number;
    compact?: boolean;
    singleClick?: boolean;
    term?: string;
};

export type FileOptions = CommonOptions & {
    filename?: string;
    multiple?: boolean;
    directory?: boolean;
    save?: boolean;
    separator?: string;
    confirmOverwrite?: string | boolean;
    quotedOutput?: boolean;
};

export type FontOptions = CommonOptions & {
    fontName?: string;
    preview?: string;
    separateOutput?: boolean;
    separator?: string;
    quotedOutput?: boolean;
};

export type FormFieldType =
    | 'H' | 'RO' | 'NUM' | 'CHK' | 'CB' | 'CBE' | 'CE'
    | 'FL' | 'SFL' | 'DIR' | 'CDIR' | 'FN' | 'MFL' | 'MDIR'
    | 'DT' | 'SCL' | 'SW' | 'APP' | 'ICON' | 'CLR'
    | 'BTN' | 'FBTN' | 'LINK' | 'LBL' | 'TXT';

export type FormField = {
    label: string;
    tooltip?: string;
    type?: FormFieldType;
    value?: string;
    items?: string[];
    disabled?: boolean;
};

export type FormOptions = CommonOptions & {
    fields: FormField[];
    align?: 'left' | 'center' | 'right';
    columns?: number;
    separator?: string;
    focusField?: number;
    cycleRead?: boolean;
    alignButtons?: boolean;
    itemSeparator?: string;
    dateFormat?: string;
    floatPrecision?: number;
    complete?: 'any' | 'all' | 'regex';
    scroll?: boolean;
    homogeneous?: boolean;
    changedAction?: string;
    quotedOutput?: boolean;
    outputByRow?: boolean;
    numOutput?: boolean;
    values?: string[];
};

export type HtmlOptions = CommonOptions & {
    uri?: string;
    browser?: boolean;
    printUri?: boolean;
    mime?: string;
    encoding?: string;
    userAgent?: string;
    userStyle?: string;
    disableSearch?: boolean;
    fileOp?: boolean;
    webkitProps?: string[];
    content?: string;
    uris?: string[];
};

export type ListColumnType =
    | 'TEXT' | 'NUM' | 'SZ' | 'FLT' | 'CHK' | 'RD' | 'BAR' | 'IMG' | 'HD' | 'TIP';

export type ListColumn = {
    name: string;
    tooltip?: string;
    type?: ListColumnType;
};

export type ListOptions = CommonOptions & {
    columns: ListColumn[];
    rows?: string[][];
    tree?: boolean;
    checklist?: boolean;
    radiolist?: boolean;
    separator?: string;
    multiple?: boolean;
    editable?: boolean;
    editableCols?: number[];
    noHeaders?: boolean;
    noClick?: boolean;
    noRulesHint?: boolean;
    gridLines?: 'horizontal' | 'vertical' | 'both';
    noSelection?: boolean;
    printAll?: boolean;
    printColumn?: number;
    hideColumns?: number[];
    expandColumn?: number;
    searchColumn?: number;
    tooltipColumn?: number;
    sepColumn?: number;
    sepValue?: string;
    limit?: number;
    wrapWidth?: number;
    wrapCols?: number[];
    ellipsize?: 'NONE' | 'START' | 'MIDDLE' | 'END';
    ellipsizeCols?: number[];
    dclickAction?: string;
    selectAction?: string;
    rowAction?: string;
    treeExpanded?: boolean;
    regexSearch?: boolean;
    listen?: boolean;
    quotedOutput?: boolean;
    floatPrecision?: number;
    addOnTop?: boolean;
    tail?: boolean;
    iecFormat?: boolean;
    simpleTips?: boolean;
    headerTips?: boolean;
    columnAlign?: string;
    headerAlign?: string;
};

export type NotebookOptions = CommonOptions & {
    key: number;
    tabs: Array<{ label: string; icon?: string; tooltip?: string }>;
    tabPos?: 'top' | 'bottom' | 'left' | 'right';
    tabBorders?: number;
    activeTab?: number;
    expand?: boolean;
    stack?: boolean;
};

export type NotificationOptions = CommonOptions & {
    command?: string;
    listen?: boolean;
    menu?: string;
    separator?: string;
    itemSeparator?: string;
    noMiddle?: boolean;
    hidden?: boolean;
    iconSize?: number;
};

export type AppIndicatorOptions = CommonOptions & {
    listen?: boolean;
    menu?: string;
    separator?: string;
    itemSeparator?: string;
    hidden?: boolean;
};

export type PopupOptions = CommonOptions & {
    transparent?: number;
    timeout?: number;
    keep?: boolean;
    align?: 'left' | 'center' | 'right';
};

export type PrintOptions = CommonOptions & {
    type?: 'TEXT' | 'IMAGE' | 'RAW';
    filename?: string;
    headers?: boolean;
    addPreview?: boolean;
    fontName?: string;
};

export type ProgressBarType = 'NORM' | 'RTL' | 'PULSE' | 'CPULSE';

export type ProgressBar = {
    label?: string;
    type?: ProgressBarType;
};

export type ProgressOptions = CommonOptions & {
    bars?: ProgressBar[];
    vertical?: boolean;
    align?: 'left' | 'center' | 'right';
    progressText?: string;
    hideText?: boolean;
    rtl?: boolean;
    autoClose?: boolean;
    autoKill?: boolean;
    pulsate?: boolean;
    continuous?: boolean;
    scroll?: boolean;
    enableLog?: string | boolean;
    logOnTop?: boolean;
    logExpanded?: boolean;
    logHeight?: number;
    initialValues?: number[];
};

export type ScaleOptions = CommonOptions & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    enforceStep?: boolean;
    page?: number;
    printPartial?: boolean;
    hideValue?: boolean;
    vertical?: boolean;
    invert?: boolean;
    incButtons?: boolean;
    marks?: Array<{ name?: string; value: number }>;
};

export type TextInfoOptions = CommonOptions & {
    filename?: string;
    editable?: boolean;
    wrap?: boolean;
    formatted?: boolean;
    justify?: TextAlign;
    margins?: number;
    tail?: boolean;
    line?: number;
    showCursor?: boolean;
    showUri?: boolean;
    fore?: string;
    back?: string;
    uriColor?: string;
    listen?: boolean;
    inPlace?: boolean;
    fileOp?: boolean;
    disableSearch?: boolean;
    confirmSave?: string | boolean;
    content?: string;
    lang?: string;
    theme?: string;
    mime?: string;
    lineNum?: boolean;
    lineHl?: boolean;
    lineMarks?: boolean;
    mark1Color?: string;
    mark2Color?: string;
    rightMargin?: number | boolean;
    brackets?: boolean;
    indent?: boolean;
    smartHe?: 'newer' | 'before' | 'after' | 'always';
    smartBs?: boolean;
    tabWidth?: number;
    indentWidth?: number;
    spaces?: boolean;
};

export type PanedOptions = CommonOptions & {
    key: number;
    orient?: 'horizontal' | 'vertical';
    splitter?: number;
    focused?: 1 | 2;
};

export type PictureOptions = CommonOptions & {
    size?: 'fit' | 'orig';
    inc?: number;
    filename?: string;
    fileOp?: boolean;
    imageChanged?: string;
    filenames?: string[];
};

export type MessageOptions = CommonOptions;

export type DialogOptionsMap = {
    message: MessageOptions;
    about: AboutOptions;
    app: AppOptions;
    calendar: CalendarOptions;
    color: ColorOptions;
    dnd: DndOptions;
    entry: EntryOptions;
    icons: IconsOptions;
    file: FileOptions;
    font: FontOptions;
    form: FormOptions;
    html: HtmlOptions;
    list: ListOptions;
    notebook: NotebookOptions;
    notification: NotificationOptions;
    appindicator: AppIndicatorOptions;
    popup: PopupOptions;
    print: PrintOptions;
    progress: ProgressOptions;
    scale: ScaleOptions;
    'text-info': TextInfoOptions;
    paned: PanedOptions;
    picture: PictureOptions;
};

export type YadDialogRequest<M extends DialogMode = DialogMode> = {
    mode: M;
    options: DialogOptionsMap[M];
    stdin?: string;
    positional?: string[];
};
