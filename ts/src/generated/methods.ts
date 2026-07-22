/**
 * AUTO-GENERATED from data/yad.1 — do not edit.
 * Regenerate with: bun run generate
 */

import type { DialogMode, DialogOptionsMap } from '../types/structured.ts';
import type {
    ParsedAppResult,
    ParsedFontResult,
    ParsedFormResult,
    ParsedListResult,
    YadDialogResult,
    YadProcess,
    YadRunResult
} from '../types/results.ts';
import {
    parseAppOutput,
    parseFileOutput,
    parseFontOutput,
    parseFormOutput,
    parseListOutput,
    parseStdout
} from '../cli/parse.ts';

export type DialogMethodContext = {
    getBinary: () => Promise<string>;
    run: <M extends DialogMode>(
        mode: M,
        dialogOptions: DialogOptionsMap[M],
        extra?: { stdin?: string; positional?: string[] }
    ) => Promise<YadDialogResult<string>>;
    spawn: <M extends DialogMode>(
        mode: M,
        dialogOptions: DialogOptionsMap[M],
        extra?: { stdin?: string; positional?: string[] }
    ) => Promise<YadProcess & { mode: M; options: DialogOptionsMap[M] }>;
    runDialog: <M extends DialogMode, T>(
        binary: string,
        mode: M,
        options: DialogOptionsMap[M],
        parse: (stdout: string, result: YadRunResult) => T | null,
        extra?: { stdin?: string; positional?: string[] }
    ) => Promise<YadDialogResult<T>>;
};

export const buildDialogMethods = ({
    getBinary,
    run,
    spawn,
    runDialog
}: DialogMethodContext) => ({
    message: (opts: DialogOptionsMap['message'] = {}) =>
        run('message', opts),
    about: (opts: DialogOptionsMap['about'] = {}) =>
        run('about', opts),
    chooseApp: async (opts: DialogOptionsMap['app'] = {}): Promise<YadDialogResult<ParsedAppResult>> =>
        runDialog(
            await getBinary(),
            'app',
            opts,
            stdout => parseAppOutput(stdout, opts.extended === true)
        ),
    appIndicator: (opts: DialogOptionsMap['appindicator'] = {}) =>
        spawn('appindicator', { listen: true, ...opts }),
    calendar: async (opts: DialogOptionsMap['calendar'] = {}): Promise<YadDialogResult<string>> =>
        runDialog(await getBinary(), 'calendar', opts, parseStdout),
    color: async (opts: DialogOptionsMap['color'] = {}): Promise<YadDialogResult<string>> =>
        runDialog(await getBinary(), 'color', opts, parseStdout),
    dnd: (opts: DialogOptionsMap['dnd'] = {}) =>
        spawn('dnd', opts),
    entry: async (opts: DialogOptionsMap['entry'] = {}): Promise<YadDialogResult<string>> =>
        runDialog(await getBinary(), 'entry', opts, parseStdout),
    file: async (opts: DialogOptionsMap['file'] = {}): Promise<YadDialogResult<string | string[]>> =>
        runDialog(
            await getBinary(),
            'file',
            opts,
            stdout => parseFileOutput(stdout, opts.multiple, opts.separator)
        ),
    font: async (opts: DialogOptionsMap['font'] = {}): Promise<YadDialogResult<ParsedFontResult>> =>
        runDialog(
            await getBinary(),
            'font',
            opts,
            stdout => parseFontOutput(stdout, opts.separateOutput, opts.separator)
        ),
    form: async (opts: DialogOptionsMap['form']): Promise<YadDialogResult<ParsedFormResult>> =>
        runDialog(
            await getBinary(),
            'form',
            opts,
            stdout => parseFormOutput(stdout, opts.fields, opts.separator)
        ),
    html: (opts: DialogOptionsMap['html'] = {}) =>
        spawn('html', opts),
    icons: (opts: DialogOptionsMap['icons'] = {}) =>
        spawn('icons', opts),
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
    paned: (opts: DialogOptionsMap['paned'] = {}) =>
        run('paned', opts),
    picture: (opts: DialogOptionsMap['picture'] = {}) =>
        run('picture', opts),
    popup: (opts: DialogOptionsMap['popup'] = {}) =>
        run('popup', opts),
    print: (opts: DialogOptionsMap['print'] = {}) =>
        run('print', opts),
    progress: (opts: DialogOptionsMap['progress'] = {}) =>
        spawn('progress', { autoClose: true, ...opts }),
    scale: async (opts: DialogOptionsMap['scale'] = {}): Promise<YadDialogResult<string>> =>
        runDialog(await getBinary(), 'scale', opts, parseStdout),
    textInfo: async (opts: DialogOptionsMap['text-info'] = {}): Promise<YadDialogResult<string>> =>
        runDialog(await getBinary(), 'text-info', opts, parseStdout),
});

