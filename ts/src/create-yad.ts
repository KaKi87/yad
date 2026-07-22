import type {
    CommonOptions,
    CreateYadOptions,
    DialogMode,
    DialogOptionsMap
} from './types/structured.ts';
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
} from './validation/main.ts';
import {
    findYadBinary,
    spawnYad,
    runYad
} from './cli/spawn.ts';
import {
    parseStdout,
    shouldHaveStdout,
    enrichResult
} from './cli/parse.ts';
import {
    buildDialogArgs,
    resolveStdin
} from './cli/args.ts';
import { buildDialogMethods } from './generated/methods.ts';
import {
    StockButton,
    ExitCode
} from './generated/stock.ts';

export type YadInstance = ReturnType<typeof createYad>;

export type {
    CommonOptions,
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
                keepStdinOpen = ['progress', 'notification', 'appindicator'].includes(mode),
                proc = spawnYad({ binary, args, stdin, keepStdinOpen });

            return { ...proc, mode, options: validated };
        },

        dialogMethods = buildDialogMethods({
            getBinary,
            run,
            spawn,
            runDialog
        });

    return {
        path: config.path,
        binary: getBinary,
        run,
        spawn,
        ...dialogMethods,

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

    return enrichResult(result, value);
};
