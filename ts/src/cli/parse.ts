import { ExitCode } from '../generated/stock.ts';
import type {
    YadRunResult,
    YadDialogResult,
    ParsedFormResult,
    ParsedListResult,
    ParsedFontResult,
    ParsedAppResult
} from '../types/results.ts';
import type { FormField } from '../types/structured.ts';

export const
    isOk = (exitCode: number): boolean =>
        exitCode === ExitCode.ok,

    isCancelled = (exitCode: number): boolean =>
        exitCode === ExitCode.cancel,

    isTimedOut = (exitCode: number): boolean =>
        exitCode === ExitCode.timeout,

    isEscaped = (exitCode: number): boolean =>
        exitCode === ExitCode.escape,

    shouldHaveStdout = (
        exitCode: number,
        alwaysPrintResult?: boolean
    ): boolean => {
        if(alwaysPrintResult && !isTimedOut(exitCode) && !isEscaped(exitCode))
            return true;

        if(isOk(exitCode))
            return true;

        return exitCode % 2 === 0 && exitCode !== ExitCode.timeout && exitCode !== ExitCode.escape;
    },

    enrichResult = <T = string>(
        result: YadRunResult,
        value: T | null
    ): YadDialogResult<T> => ({
            ...result,
            value,
            ok: isOk(result.exitCode),
            cancelled: isCancelled(result.exitCode),
            timedOut: isTimedOut(result.exitCode),
            escaped: isEscaped(result.exitCode)
        }),

    parseStdout = (stdout: string): string =>
        stdout.replace(/\n$/, ''),

    parseFormOutput = (
        stdout: string,
        fields: FormField[],
        separator = '|'
    ): ParsedFormResult => {
        const
            values = parseStdout(stdout).split(separator),
            byLabel: Record<string, string> = {};
        let valueIndex = 0;

        for(const field of fields){
            if(OUTPUT_SKIP_TYPES.has(field.type ?? ''))
                continue;

            byLabel[field.label] = values[valueIndex] ?? '';
            valueIndex++;
        }

        return { fields: values, byLabel };
    },

    parseListOutput = (
        stdout: string,
        separator = '|'
    ): ParsedListResult => ({
        rows: parseStdout(stdout)
            .split('\n')
            .filter(Boolean)
            .map(line => line.split(separator))
    }),

    parseFontOutput = (
        stdout: string,
        separateOutput?: boolean,
        separator = '|'
    ): ParsedFontResult => {
        const full = parseStdout(stdout);

        if(!separateOutput)
            return { full };

        const [family, face, size] = full.split(separator);
        return { full, family, face, size };
    },

    parseAppOutput = (
        stdout: string,
        extended?: boolean,
        separator = '|'
    ): ParsedAppResult => {
        const text = parseStdout(stdout);

        if(!extended)
            return { executable: text };

        const [name, display, description, icon, executable] = text.split(separator);
        return {
            executable: executable ?? text,
            extended: { name: name!, display: display!, description: description!, icon: icon!, executable: executable! }
        };
    },

    parseFileOutput = (
        stdout: string,
        multiple?: boolean,
        separator = '\n'
    ): string | string[] => {
        const text = parseStdout(stdout);

        if(!multiple)
            return text;

        if(separator === '\n')
            return text.split('\n').filter(Boolean);

        return text.split(separator).filter(Boolean);
    };

const OUTPUT_SKIP_TYPES = new Set(['LBL', 'BTN', 'FBTN', 'LINK']);
