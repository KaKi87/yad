import {
    describe,
    expect,
    test
} from 'bun:test';

import {
    createYad,
    ExitCode
} from '../mod.ts';

import {
    resolveTestBinary,
    signalOk,
    skipWithoutDisplay
} from './helpers.ts';

const binary = resolveTestBinary() ?? '/usr/bin/yad';

describe('createYad integration', () => {
    test('resolves system binary by default', async () => {
        const
            yad = createYad(),
            path = await yad.binary();
        expect(path).toBeTruthy();
    });

    test('uses custom binary path', async () => {
        const yad = createYad({ path: binary });
        expect(await yad.binary()).toBe(binary);
    });

    test('version exits with code 252 per yad quirk', async () => {
        const result = await Bun.$ `${binary} --version`.quiet().nothrow();
        expect(result.exitCode).toBe(ExitCode.escape);
        expect(result.stdout.toString()).toMatch(/\d+\.\d+/);
    });
});

describe('GUI dialogs', () => {
    test('message dialog closes via SIGUSR1 with exit 0', async () => {
        if(skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            proc = await yad.spawn('message', {
                text: 'Integration test',
                noButtons: true,
                undecorated: true
            }),

            waitPromise = proc.wait();
        await signalOk(proc.pid);
        const result = await waitPromise;

        expect(result.exitCode).toBe(ExitCode.ok);
    });

    test('info helper spawns message with information icon', async () => {
        if(skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            proc = await yad.spawn('message', {
                text: 'Info test',
                image: 'dialog-information',
                noButtons: true,
                buttons: [{ id: 'yad-ok' }]
            }),

            waitPromise = proc.wait();
        await signalOk(proc.pid);
        const result = await waitPromise;
        expect(result.exitCode).toBe(ExitCode.ok);
    });

    test('form dialog returns parsed field values on OK', async () => {
        if(skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            proc = await yad.spawn('form', {
                title: 'Test Form',
                fields: [
                    { label: 'Name', value: 'TestUser' },
                    { label: 'Active', type: 'CHK', value: 'TRUE' }
                ],
                values: ['TestUser', 'TRUE'],
                noButtons: true
            }),

            waitPromise = proc.wait();
        await signalOk(proc.pid, 800);
        const result = await waitPromise;

        expect(result.exitCode).toBe(ExitCode.ok);
        expect(result.stdout.replace(/\n$/, '').replace(/\|$/, '')).toBe('TestUser|TRUE');
    });

    test('timeout yields exit code 70', async () => {
        if(skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            result = await yad.message({
                text: 'Timeout test',
                timeout: 1,
                noButtons: true
            });

        expect(result.exitCode).toBe(ExitCode.timeout);
        expect(result.timedOut).toBe(true);
    });
});

describe('YadApp high-level API', () => {
    test('wizard runs custom steps and accumulates state', async () => {
        const
            yad = createYad({ path: binary }),
            app = yad.app(),
            wizard = app.wizard([
                {
                    type: 'custom',
                    run: async ({ state }) => state.step = 1
                },
                {
                    type: 'custom',
                    run: async ({ state }) => state.step = 2
                }
            ]),

            result = await wizard.run();
        expect(result.completed).toBe(true);
        expect(result.state.step).toBe(2);
    });

    test('wizard info step can be closed via SIGUSR1', async () => {
        if(skipWithoutDisplay())
            return;

        const
            yad = createYad({ path: binary }),
            app = yad.app({ title: 'Wizard' }),
            wizard = app.wizard([{ type: 'info', text: 'Welcome' }]),

            wizardPromise = wizard.run();
        await Bun.sleep(500);

        const ps = await Bun.$ `pgrep -n yad`.quiet().nothrow();
        if(ps.exitCode === 0)
            process.kill(Number(ps.stdout.toString().trim()), 'SIGUSR1');

        const result = await wizardPromise;
        expect(result.completed).toBe(true);
    });

    test('app state helpers', () => {
        const
            yad = createYad({ path: binary }),
            app = yad.app();

        app.set('name', 'Alice');
        app.merge({ age: 30 });
        expect(app.get<string>('name')).toBe('Alice');
        expect(app.state).toEqual({ name: 'Alice', age: 30 });
    });
});
