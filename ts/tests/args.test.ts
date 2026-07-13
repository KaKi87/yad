import {
    describe,
    expect,
    test
} from 'bun:test';

import {
    buildButton,
    buildCommonArgs,
    buildDialogArgs,
    formatFormField,
    formatListColumn
} from '../src/cli/args.ts';
import { StockButton } from '../src/types/exit-codes.ts';

describe('buildCommonArgs', () => {
    test('maps title and geometry options', () => {
        const args = buildCommonArgs({
            title: 'Hello',
            width: 400,
            height: 300,
            center: true
        });

        expect(args).toContain('--title=Hello');
        expect(args).toContain('--width=400');
        expect(args).toContain('--height=300');
        expect(args).toContain('--center');
    });

    test('formats stock buttons', () => {
        const args = buildCommonArgs({
            buttons: [
                buildButton('Yes', StockButton.yes),
                { label: 'Custom', id: 42 }
            ]
        });

        expect(args).toContain('--button=Yes:yad-yes');
        expect(args).toContain('--button=Custom:42');
    });

    test('formats file filters', () => {
        const args = buildCommonArgs({
            fileFilters: [{ name: 'Images', patterns: ['*.png', '*.jpg'] }]
        });

        expect(args).toContain('--file-filter=Images | *.png *.jpg');
    });
});

describe('buildDialogArgs', () => {
    test('adds mode flag for form dialog', () => {
        const args = buildDialogArgs('form', {
            fields: [{ label: 'Name' }, { label: 'Age', type: 'NUM' }]
        });

        expect(args).toContain('--form');
        expect(args).toContain('--field=Name');
        expect(args).toContain('--field=Age:NUM');
    });

    test('message mode has no mode flag', () => {
        const args = buildDialogArgs('message', { text: 'Hi' });
        expect(args).not.toContain('--message');
        expect(args).toContain('--text=Hi');
    });

    test('list dialog includes columns and rows via stdin resolution', () => {
        const args = buildDialogArgs('list', {
            columns: [{ name: 'Item' }, { name: 'Qty', type: 'NUM' }],
            rows: [['Apple', '3'], ['Banana', '5']]
        });

        expect(args).toContain('--list');
        expect(args).toContain('--column=Item');
        expect(args).toContain('--column=Qty:NUM');
    });
});

describe('format helpers', () => {
    test('formatFormField with tooltip and type', () => expect(formatFormField('Email', 'Your email', 'CE')).toBe('Email!Your email:CE'));

    test('formatListColumn with tooltip', () => expect(formatListColumn('Name', 'Full name', 'TEXT')).toBe('Name!Full name:TEXT'));
});
