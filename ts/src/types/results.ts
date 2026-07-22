import type { ExitCodeValue } from '../generated/stock.ts';

export type YadRunResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
};

export type YadDialogResult<T = string> = YadRunResult & {
    value: T | null;
    ok: boolean;
    cancelled: boolean;
    timedOut: boolean;
    escaped: boolean;
};

export type ParsedFormResult = {
    fields: string[];
    byLabel: Record<string, string>;
};

export type ParsedListResult = {
    rows: string[][];
};

export type ParsedFontResult = {
    full: string;
    family?: string;
    face?: string;
    size?: string;
};

export type ParsedAppResult = {
    executable: string;
    extended?: {
        name: string;
        display: string;
        description: string;
        icon: string;
        executable: string;
    };
};

export type YadProcess = {
    pid: number;
    write: (data: string) => Promise<void>;
    closeStdin: () => Promise<void>;
    kill: (signal?: number) => void;
    wait: () => Promise<YadRunResult>;
};

export type { ExitCodeValue };
