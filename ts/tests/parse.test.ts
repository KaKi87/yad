import {
    describe,
    expect,
    test
} from 'bun:test';

import {
    shouldHaveStdout,
    parseFormOutput,
    parseListOutput,
    parseFontOutput,
    parseAppOutput,
    parseFileOutput
} from '../src/cli/parse.ts';
import { ExitCode } from '../src/types/exit-codes.ts';

describe('shouldHaveStdout', () => {
    test('ok prints stdout', () => expect(shouldHaveStdout(ExitCode.ok)).toBe(true));

    test('cancel does not print stdout', () => expect(shouldHaveStdout(ExitCode.cancel)).toBe(false));

    test('even custom codes print stdout', () => {
        expect(shouldHaveStdout(4)).toBe(true);
        expect(shouldHaveStdout(5)).toBe(false);
    });

    test('alwaysPrintResult except timeout and escape', () => {
        expect(shouldHaveStdout(ExitCode.cancel, true)).toBe(true);
        expect(shouldHaveStdout(ExitCode.timeout, true)).toBe(false);
        expect(shouldHaveStdout(ExitCode.escape, true)).toBe(false);
    });
});

describe('parseFormOutput', () => {
    test('maps fields by label', () => {
        const result = parseFormOutput('Alice|30', [
            { label: 'Name' },
            { label: 'Age', type: 'NUM' }
        ]);

        expect(result.fields).toEqual(['Alice', '30']);
        expect(result.byLabel).toEqual({ Name: 'Alice', Age: '30' });
    });

    test('skips label-only fields', () => {
        const result = parseFormOutput('x', [
            { label: 'Section', type: 'LBL' },
            { label: 'Value' }
        ]);

        expect(result.byLabel).toEqual({ Value: 'x' });
    });
});

describe('parseListOutput', () => test('parses multiple rows', () => {
    const result = parseListOutput('a|1\nb|2');
    expect(result.rows).toEqual([['a', '1'], ['b', '2']]);
}));

describe('parseFontOutput', () => test('parses separate output', () => {
    const result = parseFontOutput('Sans|Bold|12', true);
    expect(result).toEqual({
        full: 'Sans|Bold|12',
        family: 'Sans',
        face: 'Bold',
        size: '12'
    });
}));

describe('parseAppOutput', () => test('parses extended app output', () => {
    const result = parseAppOutput('n|d|desc|icon|/usr/bin/foo', true);
    expect(result.executable).toBe('/usr/bin/foo');
    expect(result.extended?.name).toBe('n');
}));

describe('parseFileOutput', () => {
    test('single file', () => expect(parseFileOutput('/tmp/a.txt\n')).toBe('/tmp/a.txt'));

    test('multiple files', () => expect(parseFileOutput('/a\n/b\n', true)).toEqual(['/a', '/b']));
});
