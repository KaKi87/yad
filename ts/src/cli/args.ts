import type {
    YadButton,
    FormField,
    ListColumn,
    NotebookTab,
    FileFilter,
    MimeFilter,
    ProgressBar,
    ScaleMark,
    CommonOptions,
    DialogMode,
    DialogOptionsMap
} from '../types/structured.ts';
import {
    pushGeneratedCommonArgs,
    pushGeneratedModeArgs
} from '../generated/args.ts';
import { MODE_FLAGS } from '../generated/options.ts';

export const
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
        else if(typeof value === 'number')
            args.push(`${flag}=${value}`);
    },

    formatButton = (button: YadButton): string => {
        const { label, icon, tooltip, id } = button;

        // Stock item alone (yad uses stock id as BUTTON without custom label)
        if(!label && typeof id === 'string' && id.startsWith('yad-'))
            return id;

        const parts = [label ?? ''];
        if(icon)
            parts.push(icon);
        if(tooltip)
            parts.push(tooltip);

        return `${parts.join('!')}:${id}`;
    },

    formatFormField = (field: FormField): string => {
        const base = field.tooltip ? `${field.label}!${field.tooltip}` : field.label;
        return field.type ? `${base}:${field.type}` : base;
    },

    formatListColumn = (column: ListColumn): string => {
        const header = column.tooltip ? `${column.name}!${column.tooltip}` : column.name;
        return column.type ? `${header}:${column.type}` : header;
    },

    formatTab = (tab: NotebookTab): string => {
        const parts = [tab.label];
        if(tab.icon)
            parts.push(tab.icon);
        if(tab.tooltip)
            parts.push(tab.tooltip);
        return parts.join('!');
    },

    formatFileFilter = (filter: FileFilter): string =>
        `${filter.name} | ${filter.patterns.join(' ')}`,

    formatMimeFilter = (filter: MimeFilter): string =>
        `${filter.name} | ${filter.mimes.join(' ')}`,

    formatBar = (bar: ProgressBar): string =>
        bar.label ?? '',

    formatMark = (mark: ScaleMark): string =>
        mark.name !== undefined ? `${mark.name}:${mark.value}` : `:${mark.value}`,

    buildCommonArgs = (options: CommonOptions): string[] => {
        const
            args: string[] = [],
            helpers = { pushFlag, pushValue, pushOptional };

        pushGeneratedCommonArgs(args, options, helpers);
        pushStructuredCommonArgs(args, options);

        return args;
    },

    buildDialogArgs = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M],
        extra?: { positional?: string[] }
    ): string[] => {
        const
            args = buildCommonArgs(options),
            helpers = { pushFlag, pushValue, pushOptional },
            modeFlag = MODE_FLAGS[mode],
            positional: string[] = [...(extra?.positional ?? [])];

        if(modeFlag)
            args.push(modeFlag);

        pushGeneratedModeArgs(args, mode, options, helpers);
        pushStructuredModeArgs(mode, options, args, positional);

        return [...args, ...positional];
    },

    resolveStdin = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M]
    ): string | undefined => {
        if(mode === 'progress'){
            const o = options as DialogOptionsMap['progress'];
            return o.input;
        }
        if(mode === 'text-info'){
            const o = options as DialogOptionsMap['text-info'];
            return o.input;
        }
        if(mode === 'print'){
            const o = options as DialogOptionsMap['print'];
            return o.input;
        }
        if(mode === 'list'){
            const o = options as DialogOptionsMap['list'];
            if(o.treeRows){
                const sep = o.separator ?? '|';
                return o.treeRows
                    .map(row => {
                        const prefix = row.parentId !== undefined
                            ? `${row.id}:${row.parentId}`
                            : row.id;
                        return `${prefix}${sep}${row.cells.join(sep)}`;
                    })
                    .join('\n');
            }
            if(o.rows){
                const sep = o.separator ?? '|';
                return o.rows.map(cells => cells.join(sep)).join('\n');
            }
        }
        return undefined;
    };

const
    pushStructuredCommonArgs = (args: string[], options: CommonOptions): void => {
        if(options.buttons)
            for(const button of options.buttons)
                pushValue(args, '--button', formatButton(button));

        if(options.fileFilters)
            for(const filter of options.fileFilters)
                pushValue(args, '--file-filter', formatFileFilter(filter));

        if(options.mimeFilters)
            for(const filter of options.mimeFilters)
                pushValue(args, '--mime-filter', formatMimeFilter(filter));

        if(options.imageFilters)
            for(const filter of options.imageFilters)
                pushOptional(args, '--image-filter', filter);
    },

    pushStructuredModeArgs = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M],
        args: string[],
        positional: string[]
    ): void => {
        switch(mode){
            case 'form': {
                const o = options as DialogOptionsMap['form'];
                for(const field of o.fields)
                    pushValue(args, '--field', formatFormField(field));
                if(o.values)
                    for(const value of o.values)
                        positional.push(String(value));
                break;
            }
            case 'list': {
                const o = options as DialogOptionsMap['list'];
                for(const column of o.columns)
                    pushValue(args, '--column', formatListColumn(column));
                break;
            }
            case 'notebook': {
                const o = options as DialogOptionsMap['notebook'];
                for(const tab of o.tabs)
                    pushValue(args, '--tab', formatTab(tab));
                break;
            }
            case 'progress': {
                const o = options as DialogOptionsMap['progress'];
                if(o.bars)
                    for(const bar of o.bars)
                        pushValue(args, '--bar', formatBar(bar));
                break;
            }
            case 'scale': {
                const o = options as DialogOptionsMap['scale'];
                if(o.marks)
                    for(const mark of o.marks)
                        pushValue(args, '--mark', formatMark(mark));
                break;
            }
            case 'html': {
                const o = options as DialogOptionsMap['html'];
                if(o.wkProps)
                    for(const prop of o.wkProps)
                        pushValue(args, '--wk-prop', prop);
                break;
            }
            case 'entry': {
                const o = options as DialogOptionsMap['entry'];
                if(o.numericRange)
                    for(const part of o.numericRange)
                        if(part !== undefined)
                            positional.push(String(part));
                if(o.data)
                    for(const item of o.data)
                        positional.push(item);
                break;
            }
            case 'app': {
                const o = options as DialogOptionsMap['app'];
                if(o.mimeType)
                    positional.push(o.mimeType);
                break;
            }
        }
    };
