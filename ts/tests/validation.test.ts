import {
    describe,
    expect,
    test
} from 'bun:test';

import {
    validateCreateYadOptions,
    validateDownloadYadOptions,
    validateDialogOptions
} from '../src/validation/main.ts';

describe('validateCreateYadOptions', () => {
    test('accepts empty options', () => expect(validateCreateYadOptions()).toEqual({}));

    test('accepts custom path', () => expect(validateCreateYadOptions({ path: '/usr/bin/yad' })).toEqual({
        path: '/usr/bin/yad'
    }));

    test('rejects unknown keys', () => expect(() => validateCreateYadOptions({ unknown: true } as never)).toThrow(/Invalid createYad/));
});

describe('validateDownloadYadOptions', () => {
    test('accepts empty options', () => expect(validateDownloadYadOptions()).toEqual({}));

    test('accepts destination path and arch', () => expect(validateDownloadYadOptions({
        path: '/tmp/yad',
        arch: 'amd64'
    })).toEqual({
        path: '/tmp/yad',
        arch: 'amd64'
    }));

    test('rejects invalid arch', () => expect(() => validateDownloadYadOptions({ arch: 'ppc64' } as never)).toThrow(/Invalid download/));
});

describe('validateDialogOptions', () => {
    test('validates form requires fields', () => expect(() => validateDialogOptions('form', { fields: [] })).toThrow(/Invalid form/));

    test('accepts valid form', () => {
        const options = validateDialogOptions('form', {
            fields: [{ label: 'Name' }]
        });
        expect(options.fields).toHaveLength(1);
    });

    test('validates list requires columns', () => expect(() => validateDialogOptions('list', { columns: [] } as never)).toThrow(/Invalid list/));

    test('rejects unknown dialog keys', () => expect(() => validateDialogOptions('entry', { notARealOption: true } as never)).toThrow(/Invalid entry/));

    test('accepts common enums', () => {
        const options = validateDialogOptions('message', {
            buttonsLayout: 'center',
            textAlign: 'left',
            timeoutIndicator: 'top'
        });
        expect(options.buttonsLayout).toBe('center');
    });

    test('rejects invalid enum', () => expect(() => validateDialogOptions('message', {
        buttonsLayout: 'diagonal' as never
    })).toThrow(/Invalid message/));

    test('validates notebook requires tabs', () => {
        const options = validateDialogOptions('notebook', {
            key: 1,
            tabs: [{ label: 'Tab 1' }]
        });
        expect(options).toMatchObject({
            key: 1,
            tabs: [{ label: 'Tab 1' }]
        });
    });
});
