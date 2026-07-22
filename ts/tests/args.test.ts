import {
    describe,
    test,
    expect
} from 'bun:test';

import {
    formatButton,
    formatFormField,
    formatListColumn,
    buildDialogArgs
} from '../src/cli/args.ts';
import { StockButton } from '../src/generated/stock.ts';

describe('formatters', () => {
    test('formatButton formats stock and custom buttons', () => {
        expect(formatButton({ id: StockButton.ok })).toBe('yad-ok');
        expect(formatButton({ label: 'Save', id: 0, icon: 'document-save' })).toBe('Save!document-save:0');
        expect(formatButton({ label: 'Go', icon: 'x', tooltip: 'run', id: 2 })).toBe('Go!x!run:2');
        expect(formatButton({ label: 'Go', id: 2 })).toBe('Go:2');
    });

    test('formatFormField and formatListColumn', () => {
        expect(formatFormField({ label: 'Name' })).toBe('Name');
        expect(formatFormField({ label: 'Age', type: 'NUM', tooltip: 'years' })).toBe('Age!years:NUM');
        expect(formatListColumn({ name: 'Size', type: 'SZ' })).toBe('Size:SZ');
    });
});

describe('buildDialogArgs', () => {
    test('builds message dialog with common options', () => {
        const args = buildDialogArgs('message', {
            title: 'Hello',
            width: 400,
            center: true,
            timeout: 5,
            text: 'Hi'
        });
        expect(args).toContain('--title=Hello');
        expect(args).toContain('--width=400');
        expect(args).toContain('--center');
        expect(args).toContain('--timeout=5');
        expect(args).toContain('--text=Hi');
        expect(args.some(a => a === '--form' || a === '--entry')).toBe(false);
    });

    test('builds form with fields and mode flag', () => {
        const args = buildDialogArgs('form', {
            title: 'Form',
            fields: [
                { label: 'Name' },
                { label: 'Age', type: 'NUM' }
            ],
            values: ['Ada', 36],
            separator: ';'
        });
        expect(args).toContain('--form');
        expect(args).toContain('--field=Name');
        expect(args).toContain('--field=Age:NUM');
        expect(args).toContain('--separator=;');
        expect(args.at(-2)).toBe('Ada');
        expect(args.at(-1)).toBe('36');
    });

    test('builds list with columns', () => {
        const args = buildDialogArgs('list', {
            columns: [{ name: 'A' }, { name: 'B', type: 'NUM' }],
            multiple: true
        });
        expect(args).toContain('--list');
        expect(args).toContain('--column=A');
        expect(args).toContain('--column=B:NUM');
        expect(args).toContain('--multiple');
    });

    test('builds entry with optional expander', () => {
        expect(buildDialogArgs('entry', { expander: true })).toContain('--expander');
        expect(buildDialogArgs('entry', { expander: 'More' })).toContain('--expander=More');
    });
});
