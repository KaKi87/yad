import type {
    DialogOptionsMap,
    ListColumn,
    FormField
} from '../types/dialogs.ts';
import type {
    YadDialogResult,
    ParsedFormResult,
    YadProcess
} from '../types/results.ts';
import type { CommonOptions } from '../types/common.ts';
import {
    ExitCode,
    StockButton
} from '../types/exit-codes.ts';

import {
    type WizardStep,
    createWizard
} from './wizard.ts';
import {
    type ProgressRunnerOptions,
    type ProgressHandle,
    createProgressHandle,
    type TrayRunnerOptions,
    type TrayHandle,
    createTrayHandle
} from './long-running.ts';

export type YadAppBackend = {
    getBinary: () => Promise<string>;
    run: <M extends keyof DialogOptionsMap>(
        mode: M,
        options: DialogOptionsMap[M],
    ) => Promise<YadDialogResult<string>>;
    spawn: <M extends keyof DialogOptionsMap>(
        mode: M,
        options: DialogOptionsMap[M],
    ) => Promise<unknown>;
    message: (options?: DialogOptionsMap['message']) => Promise<YadDialogResult<string>>;
    form: (options: DialogOptionsMap['form']) => Promise<YadDialogResult<ParsedFormResult>>;
    entry: (options?: DialogOptionsMap['entry']) => Promise<YadDialogResult<string>>;
    list: (options: DialogOptionsMap['list']) => Promise<YadDialogResult<unknown>>;
    file: (options?: DialogOptionsMap['file']) => Promise<YadDialogResult<unknown>>;
    progress: (options?: DialogOptionsMap['progress']) => Promise<unknown>;
    notification: (options?: DialogOptionsMap['notification']) => Promise<unknown>;
    question: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) => Promise<YadDialogResult<string>>;
    info: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) => Promise<YadDialogResult<string>>;
    warning: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) => Promise<YadDialogResult<string>>;
    error: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) => Promise<YadDialogResult<string>>;
};

export type YadAppOptions = {
    yad: YadAppBackend;
    defaults?: CommonOptions;
};

export type PromptOptions = {
    label?: string;
    default?: string;
    password?: boolean;
    numeric?: boolean;
    items?: string[];
    title?: string;
};

export type SelectOptions = {
    title?: string;
    columns: ListColumn[];
    rows: string[][];
    multiple?: boolean;
    checklist?: boolean;
    radiolist?: boolean;
    height?: number;
    width?: number;
};

export type YadApp = ReturnType<typeof createYadApp>;

export const createYadApp = ({ yad, defaults = {} }: YadAppOptions) => {
    const
        state: Record<string, unknown> = {},
        withDefaults = <T extends CommonOptions>(options: T): T => ({
            ...defaults,
            ...options
        }),
        set = <K extends string>(key: K, value: unknown): void => void (state[key] = value),
        get = <T>(key: string, fallback?: T): T | undefined =>
            (state[key] as T | undefined) ?? fallback,
        merge = (patch: Record<string, unknown>): void => void (Object.assign(state, patch)),
        prompt = async (options: PromptOptions | string): Promise<string | null> => {
            const
                opts = typeof options === 'string' ? { label: options } : options,
                result = await yad.entry(withDefaults({
                    title: opts.title ?? defaults.title,
                    entryLabel: opts.label,
                    entryText: opts.default,
                    hideText: opts.password,
                    numeric: opts.numeric,
                    items: opts.items,
                    timeout: defaults.timeout
                }));

            return result.ok ? result.value : null;
        },
        ask = async (
            text: string,
            options: Omit<DialogOptionsMap['message'], 'text'> = {}
        ): Promise<boolean> => {
            const result = await yad.question(text, withDefaults(options));
            return result.exitCode === ExitCode.ok;
        },
        alert = async (
            text: string,
            level: 'info' | 'warning' | 'error' = 'info',
            options: Omit<DialogOptionsMap['message'], 'text'> = {}
        ): Promise<void> => {
            const fn = level === 'warning' ? yad.warning
                     : level === 'error'   ? yad.error
                                           : yad.info;
            await fn(text, withDefaults(options));
        },
        pickFile = async (
            options: Omit<DialogOptionsMap['file'], keyof CommonOptions> & CommonOptions = {}
        ): Promise<string | string[] | null> => {
            const result = await yad.file(withDefaults(options));
            return result.ok ? result.value as string | string[] : null;
        },
        pickFromList = async (options: SelectOptions): Promise<string[][] | null> => {
            const result = await yad.list(withDefaults({
                title: options.title,
                width: options.width,
                height: options.height,
                columns: options.columns,
                rows: options.rows,
                multiple: options.multiple,
                checklist: options.checklist,
                radiolist: options.radiolist
            }));

            if(!result.ok || !result.value)
                return null;

            return (result.value as { rows: string[][] }).rows;
        },
        buildForm = (fields: FormField[]) => {
            const values: Record<string, string> = {};

            return {
                field: (field: FormField) => {
                    fields.push(field);
                    return buildForm(fields);
                },
                defaults: (defaultsMap: Record<string, string>) => {
                    Object.assign(values, defaultsMap);
                    return buildForm(fields);
                },
                show: async (options: Omit<DialogOptionsMap['form'], 'fields'> = {}) => {
                    const result = await yad.form(withDefaults({
                        ...options,
                        fields,
                        values: fields.map(f => values[f.label] ?? f.value ?? '')
                    }));

                    if(!result.ok || !result.value)
                        return null;

                    merge(result.value.byLabel);
                    return result.value.byLabel;
                }
            };
        },
        form = async (
            fields: FormField[],
            options: Omit<DialogOptionsMap['form'], 'fields'> = {}
        ): Promise<Record<string, string> | null> =>
            buildForm([...fields]).show(options),
        wizard = (steps: WizardStep[]) =>
            createWizard({ yad, defaults, state, steps, withDefaults }),
        flow = async <T>(
            steps: Array<(ctx: { state: Record<string, unknown> }) => Promise<T | null>>
        ): Promise<T | null> => {
            for(const step of steps){
                const result = await step({ state });
                if(result === null)
                    return null;
            }
            return state as T;
        },
        notify = async (
            options: DialogOptionsMap['notification'] & { text?: string }
        ) => yad.notification(withDefaults({
            listen: true,
            ...options
        })),
        progress = async (
            options: DialogOptionsMap['progress'] = {}
        ) => yad.progress(withDefaults({
            autoClose: true,
            ...options
        })),
        runProgress = async (
            options: ProgressRunnerOptions
        ): Promise<ProgressHandle> => {
            const
                { onReady, ...progressOptions } = options,
                proc = await yad.progress(withDefaults({
                    autoClose: true,
                    ...progressOptions
                })) as YadProcess,
                handle = createProgressHandle(proc);

            if(onReady)
                await onReady(handle);

            return handle;
        },
        runTray = async (
            options: TrayRunnerOptions = {}
        ): Promise<TrayHandle> => {
            const
                { onReady, ...trayOptions } = options,
                proc = await yad.notification(withDefaults({
                    listen: true,
                    ...trayOptions
                })) as YadProcess,
                handle = createTrayHandle(proc);

            if(onReady)
                await onReady(handle);

            return handle;
        };

    return {
        state,
        set,
        get,
        merge,
        prompt,
        ask,
        alert,
        pickFile,
        pickFromList,
        form,
        buildForm,
        wizard,
        flow,
        notify,
        progress,
        runProgress,
        runTray,
        info: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) =>
            alert(text, 'info', options),
        warning: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) =>
            alert(text, 'warning', options),
        error: (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) =>
            alert(text, 'error', options),
        confirm: ask,
        yesNo: ask,
        okCancel: async (text: string, options?: Omit<DialogOptionsMap['message'], 'text'>) => {
            const result = await yad.run('message', withDefaults({
                ...options,
                text,
                buttons: options?.buttons ?? [
                    { label: 'OK', id: StockButton.ok },
                    { label: 'Cancel', id: StockButton.cancel }
                ]
            }));
            return result.exitCode === ExitCode.ok;
        }
    };
};
