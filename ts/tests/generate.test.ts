import {
    describe,
    test,
    expect
} from 'bun:test';

import {
    parseManPage,
    parseOptionSignature
} from '../scripts/generate/parse-man.ts';
import { buildCatalog } from '../scripts/generate/normalize.ts';
import { generate } from '../scripts/generate/main.ts';

const FIXTURE = `
.SH OPTIONS
.SS Dialog options
.TP
.B \\-\\-calendar
Display calendar dialog.
.TP
.B \\-\\-form
Display form dialog
.SS General options
.TP
.B \\-\\-title=\\fITITLE\\fP
Set the dialog title.
.TP
.B \\-\\-timeout=\\fITIMEOUT\\fP
Set the dialog timeout in seconds.
.TP
.B \\-\\-buttons-layout=\\fITYPE\\fP
Set buttons layout type. Possible types are: \\fIspread\\fP, \\fIedge\\fP, \\fIstart\\fP, \\fIend\\fP or \\fIcenter\\fP.
Default is \\fIend\\fP.
.TP
.B \\-\\-button=\\fIBUTTON:ID\\fP
Add the dialog button. May be used multiple times.
.TP
.B \\-\\-expander=\\fI[TEXT]\\fP
Hide main widget with expander.
.TP
.B \\-\\-print-xid=\\fI[FILENAME]\\fP
Output X Window ID.
.TP
.B \\-\\-enable-log\\fI[=TEXT]\\fP
Show log window.
.SS Form options
.TP
.B \\-\\-field=\\fILABEL[!TOOLTIP][:TYPE]\\fP
Add field to form.
.TP
.B \\-\\-separator=\\fISTRING\\fP
Set output separator character.
.SS Paned options
.TP
.B \\-\\-key=\\fIKEY\\fP
Set the key of the children.
.SS Miscellaneous options
.TP
.B \\-?, \\-\\-help
Show summary of options.
.TP
.B \\-\\-version
Print version.

.SH STOCK ITEMS
.TS
tab (@);
l l l.
.B
ID@Label text@Icon name
_
yad-ok@OK@gtk-ok
yad-cancel@Cancel@gtk-cancel
.TE

.SH EXIT STATUS
.TP
.B 0
The user has pressed \\fIOK\\fP button
.TP
.B 1
The user has pressed \\fICancel\\fP button
.TP
.B 70
The dialog has been closed because the timeout has been reached.
.TP
.B 252
The dialog has been closed by pressing \\fIEsc\\fP
`;

describe('parseManPage', () => {
    test('extracts sections and options from fixture', () => {
        const { sections, stockItems, exitStatuses } = parseManPage(FIXTURE);
        expect(sections.map(s => s.name)).toContain('General options');
        expect(sections.map(s => s.name)).toContain('Form options');
        expect(stockItems.map(s => s.id)).toEqual(['yad-cancel', 'yad-ok']);
        expect(exitStatuses.map(e => e.code)).toEqual([0, 1, 70, 252]);
    });

    test('parses value kinds', () => {
        const [title] = parseOptionSignature('.B \\-\\-title=\\fITITLE\\fP', 'Set title.', 'common');
        expect(title).toMatchObject({ flag: 'title', valueKind: 'string' });

        const [timeout] = parseOptionSignature('.B \\-\\-timeout=\\fITIMEOUT\\fP', 'Timeout.', 'common');
        expect(timeout).toMatchObject({ flag: 'timeout', valueKind: 'number' });

        const [sticky] = parseOptionSignature('.B \\-\\-sticky', 'Sticky.', 'common');
        expect(sticky).toMatchObject({ flag: 'sticky', valueKind: 'boolean' });

        const [expander] = parseOptionSignature('.B \\-\\-expander=\\fI[TEXT]\\fP', 'Expander.', 'common');
        expect(expander).toMatchObject({ flag: 'expander', valueKind: 'optionalString' });

        const [enableLog] = parseOptionSignature('.B \\-\\-enable-log\\fI[=TEXT]\\fP', 'Log.', 'progress');
        expect(enableLog).toMatchObject({ flag: 'enable-log', valueKind: 'optionalString' });
    });
});

describe('buildCatalog', () => {
    test('is deterministic', () => {
        const
            a = JSON.stringify(buildCatalog(FIXTURE)),
            b = JSON.stringify(buildCatalog(FIXTURE));
        expect(a).toBe(b);
    });

    test('includes message mode and paned from section', () => {
        const catalog = buildCatalog(FIXTURE);
        expect(catalog.modes.map(m => m.id)).toContain('message');
        expect(catalog.modes.map(m => m.id)).toContain('calendar');
        expect(catalog.modes.map(m => m.id)).toContain('form');
        expect(catalog.modes.map(m => m.id)).toContain('paned');
        expect(catalog.modes.find(m => m.id === 'message')?.flag).toBeNull();
    });

    test('maps structured overlays and enums', () => {
        const
            catalog = buildCatalog(FIXTURE),
            button = catalog.options.find(o => o.flag === 'button');
        expect(button?.structured).toBe('buttons');
        expect(button?.repeatable).toBe(true);

        const layout = catalog.options.find(o => o.flag === 'buttons-layout');
        expect(layout?.enumValues).toEqual(['spread', 'edge', 'start', 'end', 'center']);
        expect(layout?.key).toBe('buttonsLayout');
    });

    test('skips help/version from misc', () => {
        const catalog = buildCatalog(FIXTURE);
        expect(catalog.options.some(o => o.flag === 'help')).toBe(false);
        expect(catalog.options.some(o => o.flag === 'version')).toBe(false);
    });
});

describe('generate against real man page', () => {
    test('produces stable catalog matching committed snapshot', async () => {
        const
            source = await Bun.file(new URL('../../data/yad.1', import.meta.url)).text(),
            catalog = buildCatalog(source),
            committed = await Bun.file(new URL('../src/generated/catalog.json', import.meta.url)).json();

        expect(catalog.modes).toEqual(committed.modes);
        expect(catalog.stockItems).toEqual(committed.stockItems);
        expect(catalog.exitStatuses).toEqual(committed.exitStatuses);
        expect(catalog.options).toEqual(committed.options);
    });

    test('generate() is idempotent', async () => {
        const before = await Bun.file(new URL('../src/generated/catalog.json', import.meta.url)).text();
        await generate();
        const after = await Bun.file(new URL('../src/generated/catalog.json', import.meta.url)).text();
        expect(after).toBe(before);
    });

    test('emits buildDialogMethods with chooseApp and spawn defaults', async () => {
        const methods = await Bun.file(new URL('../src/generated/methods.ts', import.meta.url)).text();
        expect(methods).toContain('export const buildDialogMethods');
        expect(methods).toContain('chooseApp:');
        expect(methods).toContain("spawn('notification', { listen: true, ...opts })");
        expect(methods).toContain("spawn('progress', { autoClose: true, ...opts })");
        expect(methods).not.toContain('info:');
    });
});
