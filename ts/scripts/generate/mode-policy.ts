import type { DialogModeDef } from './types.ts';

export type ParseKind =
    | 'stdout'
    | 'app'
    | 'file'
    | 'font'
    | 'form'
    | 'list';

export type ModePolicy = {
    kind: 'run' | 'spawn';
    /** Stdout parser for run-kind methods. Defaults to stdout for run. */
    parse?: ParseKind;
    /** Merged under user options (user wins). */
    defaults?: Record<string, unknown>;
    /** Override public method name (e.g. app → chooseApp). */
    method?: string;
    /** When true, options argument has no `= {}` default. */
    requiredOpts?: boolean;
};

/** Hand policy for dialog method codegen — not inferable from yad.1 alone. */
export const MODE_POLICY: Record<string, ModePolicy> = {
    message: { kind: 'run' },
    about: { kind: 'run' },
    app: { kind: 'run', parse: 'app', method: 'chooseApp' },
    appindicator: { kind: 'spawn', defaults: { listen: true } },
    calendar: { kind: 'run', parse: 'stdout' },
    color: { kind: 'run', parse: 'stdout' },
    dnd: { kind: 'spawn' },
    entry: { kind: 'run', parse: 'stdout' },
    file: { kind: 'run', parse: 'file' },
    font: { kind: 'run', parse: 'font' },
    form: { kind: 'run', parse: 'form', requiredOpts: true },
    html: { kind: 'spawn' },
    icons: { kind: 'spawn' },
    list: { kind: 'run', parse: 'list', requiredOpts: true },
    notebook: { kind: 'run', requiredOpts: true },
    notification: { kind: 'spawn', defaults: { listen: true } },
    paned: { kind: 'run' },
    picture: { kind: 'run' },
    popup: { kind: 'run' },
    print: { kind: 'run' },
    progress: { kind: 'spawn', defaults: { autoClose: true } },
    scale: { kind: 'run', parse: 'stdout' },
    'text-info': { kind: 'run', parse: 'stdout' }
};

export const
    resolveMethodName = (mode: DialogModeDef): string =>
        MODE_POLICY[mode.id]?.method ?? mode.method,

    resolvePolicy = (modeId: string): ModePolicy =>
        MODE_POLICY[modeId] ?? { kind: 'run' };
