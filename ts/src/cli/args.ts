import type {
    ButtonId,
    CommonOptions,
    FileFilter,
    MimeFilter,
    YadButton,
} from '../types/common.ts';
import type {
    DialogMode,
    DialogOptionsMap,
} from '../types/dialogs.ts';

export const
    buildCommonArgs = (options: CommonOptions): string[] => {
        const args: string[] = [];

        for(const [key, flag] of Object.entries(COMMON_VALUE_MAP))
            pushValue(args, flag, options[key as keyof CommonOptions] as string | number | undefined);

        for(const key of COMMON_FLAG_KEYS)
            pushFlag(args, `--${camelToKebab(key)}`, options[key as keyof CommonOptions] as boolean | undefined);

        pushOptional(args, '--expander', options.expander);
        pushOptional(args, '--kill-parent', options.killParent);
        pushOptional(args, '--use-interp', options.useInterp);
        pushOptional(args, '--print-xid', options.printXid);

        if(options.imagePaths)
            for(const path of options.imagePaths)
                pushValue(args, '--image-path', path);

        if(options.buttons)
            for(const button of options.buttons)
                pushValue(args, '--button', formatButton(button));

        if(options.fileFilters)
            for(const filter of options.fileFilters as FileFilter[])
                pushValue(args, '--file-filter', `${filter.name} | ${filter.patterns.join(' ')}`);

        if(options.mimeFilters)
            for(const filter of options.mimeFilters as MimeFilter[])
                pushValue(args, '--mime-filter', `${filter.name} | ${filter.mimes.join(' ')}`);

        if(options.imageFilters)
            for(const filter of options.imageFilters)
                pushOptional(args, '--image-filter', filter);

        return args;
    },

    formatFormField = (
        label: string,
        tooltip?: string,
        type?: string,
    ): string => {
        const base = tooltip ? `${label}!${tooltip}` : label;
        return type ? `${base}:${type}` : base;
    },

    formatListColumn = (
        name: string,
        tooltip?: string,
        type?: string,
    ): string => {
        const header = tooltip ? `${name}!${tooltip}` : name;
        return type ? `${header}:${type}` : header;
    },

    formatListRow = (
        cells: string[],
        separator = '|',
    ): string => cells.join(separator),

    formatTreeRow = (
        rowId: string,
        parentId: string | undefined,
        cells: string[],
        separator = '|',
    ): string => {
        const prefix = parentId !== undefined ? `${rowId}:${parentId}` : rowId;
        return `${prefix}${separator}${cells.join(separator)}`;
    },

    quoteShell = (value: string): string =>
        `'${value.replace(/'/g, `'\\''`)}'`,

    buildButton = (
        label: string,
        id: ButtonId,
        icon?: string,
        tooltip?: string,
    ): YadButton => ({ label, id, icon, tooltip });

export const
    buildDialogArgs = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M],
        extra?: { stdin?: string; positional?: string[] },
    ): string[] => {
        const
            built = buildModeArgs(mode, options),
            args = [...built.args, ...built.positional, ...(extra?.positional ?? [])];

        return args;
    },

    resolveStdin = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M],
        extra?: string,
    ): string | undefined => {
        const built = buildModeArgs(mode, options);
        return extra ?? built.stdin;
    };


const
    camelToKebab = (key: string): string =>
        key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`),

    formatButton = (button: YadButton): string => {
        const { label, icon, tooltip, id } = button;

        if(!label && typeof id === 'string' && id.startsWith('yad-'))
            return id;

        const parts = [label ?? ''];
        if(icon)
            parts.push(icon);
        if(tooltip)
            parts.push(tooltip);

        return `${parts.join('!')}:${id}`;
    },

    pushFlag = (args: string[], flag: string, value?: boolean): void => {
        if(value)
            args.push(flag);
    },

    pushValue = (args: string[], flag: string, value: string | number | undefined): void => {
        if(value !== undefined && value !== '')
            args.push(`${flag}=${value}`);
    },

    pushOptional = (args: string[], flag: string, value: string | number | boolean | undefined): void => {
        if(value === true)
            args.push(flag);

        else if(typeof value === 'string' && value !== '')
            args.push(`${flag}=${value}`);
    },

    COMMON_FLAG_KEYS = new Set([
        'sticky', 'fixed', 'center', 'mouse', 'onTop', 'undecorated', 'skipTaskbar',
        'maximized', 'fullscreen', 'noFocus', 'closeOnUnfocus', 'keepIconSize',
        'noMarkup', 'selectableLabels', 'noButtons', 'noEscape', 'escapeOk',
        'alwaysPrintResult', 'enableSpell', 'addPreview', 'largePreview',
    ]),

    COMMON_VALUE_MAP: Record<string, string> = {
        title: '--title',
        windowIcon: '--window-icon',
        width: '--width',
        height: '--height',
        posX: '--posx',
        posY: '--posy',
        geometry: '--geometry',
        borders: '--borders',
        windowType: '--window-type',
        text: '--text',
        textWidth: '--text-width',
        textAlign: '--text-align',
        image: '--image',
        iconTheme: '--icon-theme',
        hscrollPolicy: '--hscroll-policy',
        vscrollPolicy: '--vscroll-policy',
        buttonsLayout: '--buttons-layout',
        response: '--response',
        timeout: '--timeout',
        timeoutIndicator: '--timeout-indicator',
        plug: '--plug',
        tabNum: '--tabnum',
        uriHandler: '--uri-handler',
        f1Action: '--f1-action',
        workdir: '--workdir',
        css: '--css',
        rest: '--rest',
        spellLang: '--spell-lang',
        boolFmt: '--bool-fmt',
    },

    MODE_FLAGS: Record<DialogMode, string | null> = {
        message: null,
        about: '--about',
        app: '--app',
        calendar: '--calendar',
        color: '--color',
        dnd: '--dnd',
        entry: '--entry',
        icons: '--icons',
        file: '--file',
        font: '--font',
        form: '--form',
        html: '--html',
        list: '--list',
        notebook: '--notebook',
        notification: '--notification',
        appindicator: '--appindicator',
        popup: '--popup',
        print: '--print',
        progress: '--progress',
        scale: '--scale',
        'text-info': '--text-info',
        paned: '--paned',
        picture: '--picture',
    },

    buildModeArgs = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M],
    ): { args: string[]; positional: string[]; stdin?: string } => {
        const
            args = buildCommonArgs(options as CommonOptions),
            positional: string[] = [];
        let stdin: string | undefined;

        const modeFlag = MODE_FLAGS[mode];
        if(modeFlag)
            args.push(modeFlag);

        switch(mode){
            case 'about': {
                const o = options as DialogOptionsMap['about'];
                pushValue(args, '--pname', o.programName);
                pushValue(args, '--pversion', o.programVersion);
                pushValue(args, '--copyright', o.copyright);
                pushValue(args, '--comments', o.comments);
                pushValue(args, '--license', o.license);
                pushValue(args, '--authors', o.authors);
                pushValue(args, '--website', o.website);
                pushValue(args, '--website-label', o.websiteLabel);
                break;
            }
            case 'app': {
                const o = options as DialogOptionsMap['app'];
                pushFlag(args, '--enable-fallback', o.enableFallback);
                pushFlag(args, '--enable-other', o.enableOther);
                pushFlag(args, '--enable-all', o.enableAll);
                pushFlag(args, '--extened', o.extended);
                if(o.mimeType)
                    positional.push(o.mimeType);
                break;
            }
            case 'calendar': {
                const o = options as DialogOptionsMap['calendar'];
                pushValue(args, '--day', o.day);
                pushValue(args, '--month', o.month);
                pushValue(args, '--year', o.year);
                pushValue(args, '--date-format', o.dateFormat);
                pushFlag(args, '--show-weeks', o.showWeeks);
                pushValue(args, '--details', o.details);
                pushValue(args, '--select-action', o.selectAction);
                break;
            }
            case 'color': {
                const o = options as DialogOptionsMap['color'];
                pushValue(args, '--init-color', o.initColor);
                pushFlag(args, '--gtk-palette', o.gtkPalette);
                pushFlag(args, '--picker', o.picker);
                pushFlag(args, '--alpha', o.alpha);
                pushOptional(args, '--palette', o.palette);
                pushFlag(args, '--expand-palette', o.expandPalette);
                pushValue(args, '--mode', o.mode);
                break;
            }
            case 'dnd': {
                const o = options as DialogOptionsMap['dnd'];
                pushFlag(args, '--tooltip', o.tooltip);
                pushValue(args, '--command', o.command);
                pushValue(args, '--exit-on-drop', o.exitOnDrop);
                break;
            }
            case 'entry': {
                const o = options as DialogOptionsMap['entry'];
                pushValue(args, '--entry-label', o.entryLabel);
                pushValue(args, '--entry-text', o.entryText);
                pushFlag(args, '--hide-text', o.hideText);
                pushFlag(args, '--completion', o.completion);
                pushValue(args, '--complete', o.complete);
                pushFlag(args, '--editable', o.editable);
                pushFlag(args, '--numeric', o.numeric);
                pushValue(args, '--float-precision', o.floatPrecision);
                pushValue(args, '--licon', o.leftIcon);
                pushValue(args, '--licon-action', o.leftIconAction);
                pushValue(args, '--ricon', o.rightIcon);
                pushValue(args, '--ricon-action', o.rightIconAction);
                pushFlag(args, '--num-output', o.numOutput);
                if(o.items)
                    for(const item of o.items)
                        positional.push(String(item));
                break;
            }
            case 'file': {
                const o = options as DialogOptionsMap['file'];
                pushValue(args, '--filename', o.filename);
                pushFlag(args, '--multiple', o.multiple);
                pushFlag(args, '--directory', o.directory);
                pushFlag(args, '--save', o.save);
                pushValue(args, '--separator', o.separator);
                pushOptional(args, '--confirm-overwrite', o.confirmOverwrite);
                pushFlag(args, '--quoted-output', o.quotedOutput);
                break;
            }
            case 'font': {
                const o = options as DialogOptionsMap['font'];
                pushValue(args, '--fontname', o.fontName);
                pushValue(args, '--preview', o.preview);
                pushFlag(args, '--separate-output', o.separateOutput);
                pushValue(args, '--separator', o.separator);
                pushFlag(args, '--quoted-output', o.quotedOutput);
                break;
            }
            case 'form': {
                const o = options as DialogOptionsMap['form'];
                pushValue(args, '--align', o.align);
                pushValue(args, '--columns', o.columns);
                pushValue(args, '--separator', o.separator);
                pushValue(args, '--focus-field', o.focusField);
                pushFlag(args, '--cycle-read', o.cycleRead);
                pushFlag(args, '--align-buttons', o.alignButtons);
                pushValue(args, '--item-separator', o.itemSeparator);
                pushValue(args, '--date-format', o.dateFormat);
                pushValue(args, '--float-precision', o.floatPrecision);
                pushValue(args, '--complete', o.complete);
                pushFlag(args, '--scroll', o.scroll);
                pushFlag(args, '--homogeneous', o.homogeneous);
                pushValue(args, '--changed-action', o.changedAction);
                pushFlag(args, '--quoted-output', o.quotedOutput);
                pushFlag(args, '--output-by-row', o.outputByRow);
                pushFlag(args, '--num-output', o.numOutput);
                for(const field of o.fields){
                    const label = field.disabled
                        ? `${field.label}@disabled@`
                        : field.label;
                    pushValue(args, '--field', formatFormField(label, field.tooltip, field.type));
                }
                if(o.values)
                    for(const value of o.values)
                        positional.push(value);
                break;
            }
            case 'list': {
                const o = options as DialogOptionsMap['list'];
                for(const col of o.columns)
                    pushValue(args, '--column', formatListColumn(col.name, col.tooltip, col.type));
                pushFlag(args, '--tree', o.tree);
                pushFlag(args, '--checklist', o.checklist);
                pushFlag(args, '--radiolist', o.radiolist);
                pushValue(args, '--separator', o.separator);
                pushFlag(args, '--multiple', o.multiple);
                pushFlag(args, '--editable', o.editable);
                if(o.editableCols)
                    pushValue(args, '--editable-cols', o.editableCols.join(','));
                pushFlag(args, '--no-headers', o.noHeaders);
                pushFlag(args, '--no-click', o.noClick);
                pushFlag(args, '--no-rules-hint', o.noRulesHint);
                if(o.gridLines)
                    pushValue(args, '--grid-lines', o.gridLines === 'horizontal' ? 'hor' : o.gridLines === 'vertical' ? 'vert' : 'both');
                pushFlag(args, '--no-selection', o.noSelection);
                pushFlag(args, '--print-all', o.printAll);
                pushValue(args, '--print-column', o.printColumn);
                if(o.hideColumns)
                    for(const col of o.hideColumns)
                        pushValue(args, '--hide-column', col);
                pushValue(args, '--expand-column', o.expandColumn);
                pushValue(args, '--search-column', o.searchColumn);
                pushValue(args, '--tooltip-column', o.tooltipColumn);
                pushValue(args, '--sep-column', o.sepColumn);
                pushValue(args, '--sep-value', o.sepValue);
                pushValue(args, '--limit', o.limit);
                pushValue(args, '--wrap-width', o.wrapWidth);
                if(o.wrapCols)
                    pushValue(args, '--wrap-cols', o.wrapCols.join(','));
                pushValue(args, '--ellipsize', o.ellipsize);
                if(o.ellipsizeCols)
                    pushValue(args, '--ellipsize-cols', o.ellipsizeCols.join(','));
                pushValue(args, '--dclick-action', o.dclickAction);
                pushValue(args, '--select-action', o.selectAction);
                pushValue(args, '--row-action', o.rowAction);
                pushFlag(args, '--tree-expanded', o.treeExpanded);
                pushFlag(args, '--regex-search', o.regexSearch);
                pushFlag(args, '--listen', o.listen);
                pushFlag(args, '--quoted-output', o.quotedOutput);
                pushValue(args, '--float-precision', o.floatPrecision);
                pushFlag(args, '--add-on-top', o.addOnTop);
                pushFlag(args, '--tail', o.tail);
                pushFlag(args, '--auto-scroll', o.tail);
                pushFlag(args, '--iec-format', o.iecFormat);
                pushFlag(args, '--simple-tips', o.simpleTips);
                pushFlag(args, '--header-tips', o.headerTips);
                pushValue(args, '--column-align', o.columnAlign);
                pushValue(args, '--header-align', o.headerAlign);
                if(o.rows){
                    const sep = o.separator ?? '|';
                    stdin = o.rows.map(row => formatListRow(row, sep)).join('\n');
                }
                break;
            }
            case 'scale': {
                const o = options as DialogOptionsMap['scale'];
                pushValue(args, '--value', o.value);
                pushValue(args, '--min-value', o.minValue);
                pushValue(args, '--max-value', o.maxValue);
                pushValue(args, '--step', o.step);
                pushFlag(args, '--enforce-step', o.enforceStep);
                pushValue(args, '--page', o.page);
                pushFlag(args, '--print-partial', o.printPartial);
                pushFlag(args, '--hide-value', o.hideValue);
                pushFlag(args, '--vertical', o.vertical);
                pushFlag(args, '--invert', o.invert);
                pushFlag(args, '--inc-buttons', o.incButtons);
                if(o.marks)
                    for(const mark of o.marks){
                        const spec = mark.name ? `${mark.name}:${mark.value}` : String(mark.value);
                        pushValue(args, '--mark', spec);
                    }
                break;
            }
            case 'text-info': {
                const o = options as DialogOptionsMap['text-info'];
                pushValue(args, '--filename', o.filename);
                pushFlag(args, '--editable', o.editable);
                pushFlag(args, '--wrap', o.wrap);
                pushFlag(args, '--formatted', o.formatted);
                pushValue(args, '--justify', o.justify);
                pushValue(args, '--margins', o.margins);
                pushFlag(args, '--tail', o.tail);
                pushFlag(args, '--auto-scroll', o.tail);
                pushValue(args, '--line', o.line);
                pushFlag(args, '--show-cursor', o.showCursor);
                pushFlag(args, '--show-uri', o.showUri);
                pushValue(args, '--fore', o.fore);
                pushValue(args, '--back', o.back);
                pushValue(args, '--uri-color', o.uriColor);
                pushFlag(args, '--listen', o.listen);
                pushFlag(args, '--in-place', o.inPlace);
                pushFlag(args, '--file-op', o.fileOp);
                pushFlag(args, '--disable-search', o.disableSearch);
                pushOptional(args, '--confirm-save', o.confirmSave);
                pushValue(args, '--lang', o.lang);
                pushValue(args, '--theme', o.theme);
                pushValue(args, '--mime', o.mime);
                pushFlag(args, '--line-num', o.lineNum);
                pushFlag(args, '--line-hl', o.lineHl);
                pushFlag(args, '--line-marks', o.lineMarks);
                pushValue(args, '--mark1-color', o.mark1Color);
                pushValue(args, '--mark2-color', o.mark2Color);
                pushOptional(args, '--right-margin', o.rightMargin);
                pushFlag(args, '--brackets', o.brackets);
                pushFlag(args, '--indent', o.indent);
                pushValue(args, '--smart-he', o.smartHe);
                pushFlag(args, '--smart-bs', o.smartBs);
                pushValue(args, '--tab-width', o.tabWidth);
                pushValue(args, '--indent-width', o.indentWidth);
                pushFlag(args, '--spaces', o.spaces);
                if(o.content)
                    stdin = o.content;
                break;
            }
            case 'html': {
                const o = options as DialogOptionsMap['html'];
                pushValue(args, '--uri', o.uri);
                pushFlag(args, '--browser', o.browser);
                pushFlag(args, '--print-uri', o.printUri);
                pushValue(args, '--mime', o.mime);
                pushValue(args, '--encoding', o.encoding);
                pushValue(args, '--user-agent', o.userAgent);
                pushValue(args, '--user-style', o.userStyle);
                pushFlag(args, '--disable-search', o.disableSearch);
                pushFlag(args, '--file-op', o.fileOp);
                if(o.webkitProps)
                    for(const prop of o.webkitProps)
                        pushValue(args, '--wk-prop', prop);
                if(o.content)
                    stdin = o.content;
                if(o.uris)
                    positional.push(...o.uris);
                break;
            }
            case 'progress': {
                const o = options as DialogOptionsMap['progress'];
                if(o.bars)
                    for(const bar of o.bars)
                        pushValue(args, '--bar', bar.type ? `${bar.label ?? ''}:${bar.type}` : bar.label);
                pushFlag(args, '--vertical', o.vertical);
                pushValue(args, '--align', o.align);
                pushValue(args, '--progress-text', o.progressText);
                pushFlag(args, '--hide-text', o.hideText);
                pushFlag(args, '--rtl', o.rtl);
                pushFlag(args, '--auto-close', o.autoClose);
                pushFlag(args, '--auto-kill', o.autoKill);
                pushFlag(args, '--pulsate', o.pulsate);
                pushFlag(args, '--continuous', o.continuous);
                pushFlag(args, '--scroll', o.scroll);
                pushOptional(args, '--enable-log', o.enableLog);
                pushFlag(args, '--log-on-top', o.logOnTop);
                pushFlag(args, '--log-expanded', o.logExpanded);
                pushValue(args, '--log-height', o.logHeight);
                if(o.initialValues)
                    for(const value of o.initialValues)
                        positional.push(String(value));
                break;
            }
            case 'notification': {
                const o = options as DialogOptionsMap['notification'];
                pushValue(args, '--command', o.command);
                pushFlag(args, '--listen', o.listen);
                pushValue(args, '--menu', o.menu);
                pushValue(args, '--separator', o.separator);
                pushValue(args, '--item-separator', o.itemSeparator);
                pushFlag(args, '--no-middle', o.noMiddle);
                pushFlag(args, '--hidden', o.hidden);
                pushValue(args, '--icon-size', o.iconSize);
                break;
            }
            case 'appindicator': {
                const o = options as DialogOptionsMap['appindicator'];
                pushFlag(args, '--listen', o.listen);
                pushValue(args, '--menu', o.menu);
                pushValue(args, '--separator', o.separator);
                pushValue(args, '--item-separator', o.itemSeparator);
                pushFlag(args, '--hidden', o.hidden);
                break;
            }
            case 'popup': {
                const o = options as DialogOptionsMap['popup'];
                pushValue(args, '--transparent', o.transparent);
                pushValue(args, '--timeout', o.timeout);
                pushFlag(args, '--keep', o.keep);
                pushValue(args, '--align', o.align);
                break;
            }
            case 'notebook': {
                const o = options as DialogOptionsMap['notebook'];
                pushValue(args, '--key', o.key);
                for(const tab of o.tabs){
                    const spec = tab.icon
                        ? `${tab.label}!${tab.icon}${tab.tooltip ? `!${tab.tooltip}` : ''}`
                        : tab.label;
                    pushValue(args, '--tab', spec);
                }
                pushValue(args, '--tab-pos', o.tabPos);
                pushValue(args, '--tab-borders', o.tabBorders);
                pushValue(args, '--active-tab', o.activeTab);
                pushFlag(args, '--expand', o.expand);
                pushFlag(args, '--stack', o.stack);
                break;
            }
            case 'paned': {
                const o = options as DialogOptionsMap['paned'];
                pushValue(args, '--key', o.key);
                if(o.orient)
                    pushValue(args, '--orient', o.orient === 'horizontal' ? 'hor' : 'vert');
                pushValue(args, '--splitter', o.splitter);
                pushValue(args, '--focused', o.focused);
                break;
            }
            case 'picture': {
                const o = options as DialogOptionsMap['picture'];
                pushValue(args, '--size', o.size);
                pushValue(args, '--inc', o.inc);
                pushValue(args, '--filename', o.filename);
                pushFlag(args, '--file-op', o.fileOp);
                pushValue(args, '--image-changed', o.imageChanged);
                if(o.filenames)
                    positional.push(...o.filenames);
                break;
            }
            case 'print': {
                const o = options as DialogOptionsMap['print'];
                pushValue(args, '--type', o.type);
                pushValue(args, '--filename', o.filename);
                pushFlag(args, '--headers', o.headers);
                pushFlag(args, '--add-preview', o.addPreview);
                pushValue(args, '--fontname', o.fontName);
                break;
            }
            case 'icons': {
                const o = options as DialogOptionsMap['icons'];
                pushValue(args, '--read-dir', o.readDir);
                pushFlag(args, '--monitor', o.monitor);
                pushFlag(args, '--generic', o.generic);
                pushFlag(args, '--sort-by-name', o.sortByName);
                pushFlag(args, '--descend', o.descend);
                pushFlag(args, '--listen', o.listen);
                pushValue(args, '--item-width', o.itemWidth);
                pushValue(args, '--icon-size', o.iconSize);
                pushFlag(args, '--compact', o.compact);
                pushFlag(args, '--single-click', o.singleClick);
                pushValue(args, '--term', o.term);
                break;
            }
            default: {
                break;
            }
        }

        return { args, positional, stdin };
    };
