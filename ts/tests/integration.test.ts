import {
    describe,
    test,
    expect
} from 'bun:test';

import {
    createYad,
    ExitCode
} from '../mod.ts';

import {
    skipWithoutBinary,
    skipWithoutDisplay
} from './helpers.ts';

describe('integration', () => {
    test('yad --version exits 252 (documented quirk)', async () => {
        const binary = skipWithoutBinary();
        if(!binary)
            return;

        const
            proc = Bun.spawn([binary, '--version'], {
                stdout: 'pipe',
                stderr: 'pipe'
            }),
            [stdout, exitCode] = await Promise.all([
                new Response(proc.stdout).text(),
                proc.exited
            ]);
        expect(exitCode).toBe(252);
        expect(stdout.length + (await new Response(proc.stderr).text()).length).toBeGreaterThan(0);
    });

    test('text-info times out with ExitCode.timeout', async () => {
        const binary = skipWithoutBinary();
        if(!binary || skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            result = await yad.textInfo({
                title: 'yad.ts integration',
                text: 'timeout test',
                timeout: 1,
                noButtons: true,
                input: 'hello from yad.ts'
            });

        expect(result.timedOut).toBe(true);
        expect(result.exitCode).toBe(ExitCode.timeout);
    });

    test('entry times out', async () => {
        const binary = skipWithoutBinary();
        if(!binary || skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            result = await yad.entry({
                title: 'entry timeout',
                entryLabel: 'Name',
                timeout: 1,
                noButtons: true
            });

        expect(result.exitCode).toBe(ExitCode.timeout);
        expect(result.timedOut).toBe(true);
    });

    test('form builds and times out', async () => {
        const binary = skipWithoutBinary();
        if(!binary || skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            result = await yad.form({
                title: 'form timeout',
                timeout: 1,
                noButtons: true,
                fields: [
                    { label: 'Name' },
                    { label: 'Enabled', type: 'CHK' }
                ],
                values: ['test', 'TRUE']
            });

        expect(result.exitCode).toBe(ExitCode.timeout);
    });

    test('createYad resolves custom path', async () => {
        const binary = skipWithoutBinary();
        if(!binary)
            return;

        const yad = createYad({ path: binary });
        expect(await yad.binary()).toBe(binary);
    });
});
