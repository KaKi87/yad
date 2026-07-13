import { createYadApp } from './app/yad-app.ts';
import {
    buildDialogArgs,
    resolveStdin
} from './cli/args.ts';
import {
    enrichResult,
    parseAppOutput,
    parseFileOutput,
    parseFontOutput,
    parseFormOutput,
    parseListOutput,
    parseStdout,
    shouldHaveStdout
} from './cli/parse.ts';
import {
    findYadBinary,
    runYad,
    spawnYad
} from './cli/spawn.ts';
import type {
    CommonOptions,
    CreateYadOptions
} from './types/common.ts';
import type {
    DialogMode,
    DialogOptionsMap
} from './types/dialogs.ts';
import {
    ExitCode,
    StockButton
} from './types/exit-codes.ts';
import type {
    ParsedAppResult,
    ParsedFontResult,
    ParsedFormResult,
    ParsedListResult,
    YadDialogResult,
    YadProcess,
    YadRunResult
} from './types/results.ts';
import {
    validateCreateYadOptions,
    validateDialogOptions
} from './validation/schemas.ts';

export type YadInstance = ReturnType<typeof createYad>;

export type {
    CreateYadOptions,
    DialogMode,
    DialogOptionsMap,
    ParsedAppResult,
    ParsedFontResult,
    ParsedFormResult,
    ParsedListResult,
    YadDialogResult,
    YadProcess,
    YadRunResult
};

export const createYad = (options?: CreateYadOptions) => {
    const config = validateCreateYadOptions(options);
    let binaryPromise: Promise<string> | null = null;

    const
        getBinary = () => {
            if(!binaryPromise)
                binaryPromise = findYadBinary(config.path);
            return binaryPromise;
        },

        run = async <M extends DialogMode>(
            mode: M,
            dialogOptions: DialogOptionsMap[M],
            extra?: { stdin?: string; positional?: string[] }
        ): Promise<YadDialogResult<string>> => {
            const binary = await getBinary();
            return runDialog(binary, mode, dialogOptions, parseStdout, extra);
        },

        spawn = async <M extends DialogMode>(
            mode: M,
            dialogOptions: DialogOptionsMap[M],
            extra?: { stdin?: string; positional?: string[] }
        ): Promise<YadProcess & { mode: M; options: DialogOptionsMap[M] }> => {
            const
                binary = await getBinary(),
                validated = validateDialogOptions(mode, dialogOptions),
                args = buildDialogArgs(mode, validated, extra),
                stdin = extra?.stdin ?? resolveStdin(mode, validated),
                proc = spawnYad({ binary, args, stdin, keepStdinOpen: mode === 'progress' || mode === 'notification' || mode === 'appindicator' });

            return { ...proc, mode, options: validated };
        },

        backend = {
            getBinary,
            run,
            spawn,
            message: (opts: DialogOptionsMap['message'] = {}) => run('message', opts),
            form: async (opts: DialogOptionsMap['form']) =>
                runDialog(
                    await getBinary(),
                    'form',
                    opts,
                    stdout => parseFormOutput(stdout, opts.fields, opts.separator)
                ),
            entry: async (opts: DialogOptionsMap['entry'] = {}) =>
                runDialog(await getBinary(), 'entry', opts, parseStdout),
            list: async (opts: DialogOptionsMap['list']) =>
                runDialog(
                    await getBinary(),
                    'list',
                    opts,
                    stdout => parseListOutput(stdout, opts.separator)
                ),
            file: async (opts: DialogOptionsMap['file'] = {}) =>
                runDialog(
                    await getBinary(),
                    'file',
                    opts,
                    stdout => parseFileOutput(stdout, opts.multiple, opts.separator)
                ),
            progress: (opts: DialogOptionsMap['progress'] = {}) =>
                spawn('progress', { autoClose: true, ...opts }),
            notification: (opts: DialogOptionsMap['notification'] = {}) =>
                spawn('notification', { listen: true, ...opts }),
            question: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
                run('message', {
                    ...opts,
                    text,
                    image: opts.image ?? 'dialog-question',
                    buttons: opts.buttons ?? [
                        { label: 'Yes', id: StockButton.yes },
                        { label: 'No', id: StockButton.no }
                    ]
                }),
            info: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
                run('message', {
                    ...opts,
                    text,
                    image: opts.image ?? 'dialog-information',
                    buttons: opts.buttons ?? [{ id: StockButton.ok }]
                }),
            warning: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
                run('message', {
                    ...opts,
                    text,
                    image: opts.image ?? 'dialog-warning',
                    buttons: opts.buttons ?? [{ id: StockButton.ok }]
                }),
            error: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
                run('message', {
                    ...opts,
                    text,
                    image: opts.image ?? 'dialog-error',
                    buttons: opts.buttons ?? [{ id: StockButton.ok }]
                })
        };

    return {
        path: config.path,
        binary: getBinary,

        run,
        spawn,
        app: (defaults?: CommonOptions) =>
            createYadApp({ yad: backend, defaults }),

        chooseApp: async (opts: DialogOptionsMap['app'] = {}): Promise<YadDialogResult<ParsedAppResult>> =>
            runDialog(await getBinary(), 'app', opts, stdout => parseAppOutput(stdout, opts.extended)),

        message: (opts: DialogOptionsMap['message'] = {}) =>
            run('message', opts),

        about: (opts: DialogOptionsMap['about']) =>
            run('about', opts),

        calendar: async (opts: DialogOptionsMap['calendar'] = {}): Promise<YadDialogResult<string>> =>
            runDialog(await getBinary(), 'calendar', opts, parseStdout),

        color: async (opts: DialogOptionsMap['color'] = {}): Promise<YadDialogResult<string>> =>
            runDialog(await getBinary(), 'color', opts, parseStdout),

        dnd: (opts: DialogOptionsMap['dnd']) =>
            spawn('dnd', opts),

        entry: async (opts: DialogOptionsMap['entry'] = {}): Promise<YadDialogResult<string>> =>
            runDialog(await getBinary(), 'entry', opts, parseStdout),

        icons: (opts: DialogOptionsMap['icons']) =>
            spawn('icons', opts),

        file: async (opts: DialogOptionsMap['file'] = {}): Promise<YadDialogResult<string | string[]>> =>
            runDialog(
                await getBinary(),
                'file',
                opts,
                stdout => parseFileOutput(stdout, opts.multiple, opts.separator)
            ),

        font: async (opts: DialogOptionsMap['font'] = {}): Promise<YadDialogResult<ParsedFontResult>> =>
            runDialog(await getBinary(), 'font', opts, stdout => parseFontOutput(stdout, opts.separateOutput, opts.separator)),

        form: async (opts: DialogOptionsMap['form']): Promise<YadDialogResult<ParsedFormResult>> =>
            runDialog(
                await getBinary(),
                'form',
                opts,
                stdout => parseFormOutput(stdout, opts.fields, opts.separator)
            ),

        html: (opts: DialogOptionsMap['html']) =>
            spawn('html', opts),

        list: async (opts: DialogOptionsMap['list']): Promise<YadDialogResult<ParsedListResult>> =>
            runDialog(
                await getBinary(),
                'list',
                opts,
                stdout => parseListOutput(stdout, opts.separator)
            ),

        notebook: (opts: DialogOptionsMap['notebook']) =>
            run('notebook', opts),

        notification: (opts: DialogOptionsMap['notification'] = {}) =>
            spawn('notification', { listen: true, ...opts }),

        appIndicator: (opts: DialogOptionsMap['appindicator'] = {}) =>
            spawn('appindicator', { listen: true, ...opts }),

        popup: (opts: DialogOptionsMap['popup'] = {}) =>
            run('popup', opts),

        print: (opts: DialogOptionsMap['print']) =>
            run('print', opts),

        progress: (opts: DialogOptionsMap['progress'] = {}) =>
            spawn('progress', { autoClose: true, ...opts }),

        scale: async (opts: DialogOptionsMap['scale'] = {}): Promise<YadDialogResult<string>> =>
            runDialog(await getBinary(), 'scale', opts, parseStdout),

        textInfo: async (opts: DialogOptionsMap['text-info'] = {}): Promise<YadDialogResult<string>> =>
            runDialog(await getBinary(), 'text-info', opts, parseStdout),

        paned: (opts: DialogOptionsMap['paned']) =>
            run('paned', opts),

        picture: (opts: DialogOptionsMap['picture'] = {}) =>
            run('picture', opts),

        info: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
            run('message', {
                ...opts,
                text,
                image: opts.image ?? 'dialog-information',
                buttons: opts.buttons ?? [{ id: StockButton.ok }]
            }),

        warning: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
            run('message', {
                ...opts,
                text,
                image: opts.image ?? 'dialog-warning',
                buttons: opts.buttons ?? [{ id: StockButton.ok }]
            }),

        error: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
            run('message', {
                ...opts,
                text,
                image: opts.image ?? 'dialog-error',
                buttons: opts.buttons ?? [{ id: StockButton.ok }]
            }),

        question: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
            run('message', {
                ...opts,
                text,
                image: opts.image ?? 'dialog-question',
                buttons: opts.buttons ?? [
                    { label: 'Yes', id: StockButton.yes },
                    { label: 'No', id: StockButton.no }
                ]
            }),

        confirm: (text: string, opts: Omit<DialogOptionsMap['message'], 'text'> = {}) =>
            run('message', {
                ...opts,
                text,
                buttons: opts.buttons ?? [
                    { label: 'OK', id: StockButton.ok },
                    { label: 'Cancel', id: StockButton.cancel }
                ]
            })
    };
};

export {
    ExitCode,
    StockButton
};

const runDialog = async <M extends DialogMode, T>(
    binary: string,
    mode: M,
    options: DialogOptionsMap[M],
    parse: (stdout: string, result: YadRunResult) => T | null,
    extra?: { stdin?: string; positional?: string[] }
): Promise<YadDialogResult<T>> => {
    const
        validated = validateDialogOptions(mode, options),
        args = buildDialogArgs(mode, validated, extra),
        stdin = extra?.stdin ?? resolveStdin(mode, validated),
        result = await runYad({ binary, args, stdin }),
        value = shouldHaveStdout(result.exitCode, validated.alwaysPrintResult)
            ? parse(result.stdout, result)
            : null;

    return enrichResult(result, value, validated.alwaysPrintResult);
};
