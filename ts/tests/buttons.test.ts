import {
    describe,
    test,
    expect
} from 'bun:test';

import {
    buttons,
    primaryDismissCode,
    primarySubmitCode,
    printsResult
} from '../src/buttons/main.ts';
import { StockButton } from '../src/generated/stock.ts';

describe('buttons.define', () => {
    test('assigns primary submit and dismiss codes', () => {
        const dialogButtons = buttons.define({
            clear: buttons.dismiss({ label: 'Clear History', icon: 'gtk-clear' }),
            cancel: buttons.cancel(),
            run: buttons.submit(StockButton.execute)
        });

        expect(dialogButtons.get('clear').exitCode).toBe(3);
        expect(dialogButtons.get('cancel').exitCode).toBe(primaryDismissCode);
        expect(dialogButtons.get('run').exitCode).toBe(primarySubmitCode);
    });

    test('maps exit codes back to button names', () => {
        const dialogButtons = buttons.define({
            clear: buttons.dismiss({ label: 'Clear History', icon: 'gtk-clear' }),
            cancel: buttons.cancel(),
            run: buttons.submit(StockButton.execute)
        });

        expect(dialogButtons.match(3)).toBe('clear');
        expect(dialogButtons.match(1)).toBe('cancel');
        expect(dialogButtons.match(0)).toBe('run');
        expect(dialogButtons.match(252)).toBeNull();
    });

    test('uses numeric ids in yad button list', () => {
        const dialogButtons = buttons.define({
            clear: buttons.dismiss({ label: 'Clear History', icon: 'gtk-clear' }),
            cancel: buttons.cancel(),
            run: buttons.submit(StockButton.execute)
        });

        expect(dialogButtons.list).toEqual([
            { label: 'Clear History', icon: 'gtk-clear', id: 3 },
            { label: 'Cancel', icon: 'gtk-cancel', id: 1 },
            { label: 'Execute', icon: 'system-run', id: 0 }
        ]);
    });

    test('allocates additional dismiss codes as odd numbers from 3', () => {
        const dialogButtons = buttons.define({
            first: buttons.dismiss({ label: 'First' }),
            second: buttons.dismiss({ label: 'Second' }),
            cancel: buttons.cancel()
        });

        expect(dialogButtons.get('first').exitCode).toBe(3);
        expect(dialogButtons.get('second').exitCode).toBe(5);
        expect(dialogButtons.get('cancel').exitCode).toBe(1);
    });

    test('marks submit buttons as printing stdout', () => {
        const dialogButtons = buttons.define({
            run: buttons.submit(StockButton.execute)
        });

        expect(dialogButtons.get('run').printsResult).toBe(true);
        expect(dialogButtons.get('run').role).toBe('submit');
    });

    test('marks dismiss buttons as not printing stdout', () => {
        const dialogButtons = buttons.define({
            clear: buttons.dismiss({ label: 'Clear History' })
        });

        expect(dialogButtons.get('clear').printsResult).toBe(false);
        expect(dialogButtons.get('clear').role).toBe('dismiss');
    });

    test('supports command buttons without exit codes', () => {
        const dialogButtons = buttons.define({
            preview: buttons.command({
                label: 'Preview',
                command: 'bash -c preview.sh'
            })
        });

        expect(dialogButtons.get('preview').exitCode).toBeNull();
        expect(dialogButtons.get('preview').yad.id).toBe('bash -c preview.sh');
        expect(dialogButtons.match(0)).toBeNull();
    });

    test('supports custom submit labels', () => {
        const dialogButtons = buttons.define({
            go: buttons.submit({ label: 'Go', icon: 'go-next', tooltip: 'Run it' })
        });

        expect(dialogButtons.list[0]).toEqual({
            label: 'Go',
            icon: 'go-next',
            tooltip: 'Run it',
            id: 0
        });
    });
});

describe('printsResult', () => test('follows yad even/odd rule', () => {
    expect(printsResult(0)).toBe(true);
    expect(printsResult(1)).toBe(false);
    expect(printsResult(2)).toBe(true);
    expect(printsResult(3)).toBe(false);
    expect(printsResult(70)).toBe(false);
    expect(printsResult(252)).toBe(false);
}));
