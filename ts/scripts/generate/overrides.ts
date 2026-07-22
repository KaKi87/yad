import type { StructuredKind } from './types.ts';

/** Map man-page `.SS` headings to logical group ids. */
export const
    SECTION_TO_GROUP: Record<string, string> = {
        'Dialog options': '_modes',
        'General options': 'common',
        'Custom about dialog options': 'about',
        'Application selection options': 'app',
        'Calendar options': 'calendar',
        'Color selection options': 'color',
        'Drag-and-Drop box options': 'dnd',
        'Text entry options': 'entry',
        'Iconbox options': 'icons',
        'File selection options': 'file',
        'Font selection options': 'font',
        'Form options': 'form',
        'HTML options': 'html',
        'List options': 'list',
        'Notebook options': 'notebook',
        'Notification options': 'notification',
        'Appindicator options': 'appindicator',
        'Paned options': 'paned',
        'Picture options': 'picture',
        'Popup options': 'popup',
        'Print options': 'print',
        'Progress options': 'progress',
        'Text info options': 'text-info',
        'Scale options': 'scale',
        'File filters options': 'common',
        'File preview options': 'common',
        'Miscellaneous options': 'misc'
    },
    DIALOG_GROUPS = [
        'about', 'app', 'calendar', 'color', 'dnd', 'entry', 'icons', 'file',
        'font', 'form', 'html', 'list', 'notebook', 'notification', 'appindicator',
        'paned', 'picture', 'popup', 'print', 'progress', 'text-info', 'scale'
    ] as const,
    STRUCTURED_FLAGS: Record<string, StructuredKind> = {
        button: 'buttons',
        field: 'fields',
        column: 'columns',
        tab: 'tabs',
        'file-filter': 'fileFilters',
        'mime-filter': 'mimeFilters',
        'image-filter': 'imageFilters',
        'image-path': 'imagePaths',
        bar: 'bars',
        mark: 'marks',
        'wk-prop': 'wkProps'
    },
    SKIP_FLAGS = new Set([
        'help',
        'version',
        'about' // --about is a mode flag, not an about-dialog option; handled via modes
    ]),
    KEY_OVERRIDES: Record<string, string> = {
        posx: 'posX',
        posy: 'posY',
        tabnum: 'tabNum',
        pname: 'programName',
        pversion: 'programVersion',
        extened: 'extended', // yad typo preserved on CLI, cleaned in API
        '2btn': 'twoButtons'
    },
    EXTRA_MODES: { id: string; flag: string }[] = [
        { id: 'paned', flag: '--paned' },
        { id: 'picture', flag: '--picture' }
    ],
    ENUM_OVERRIDES: Record<string, string[]> = {
        'timeout-indicator': ['top', 'bottom', 'left', 'right'],
        'buttons-layout': ['spread', 'edge', 'start', 'end', 'center'],
        'text-align': ['left', 'right', 'center', 'fill'],
        'window-type': ['normal', 'dialog', 'utility', 'dock', 'desktop', 'tooltip', 'notification', 'splash'],
        'hscroll-policy': ['auto', 'always', 'never'],
        'vscroll-policy': ['auto', 'always', 'never'],
        'bool-fmt': ['T', 't', 'Y', 'y', 'O', 'o', '1'],
        license: ['GPL2', 'GPL3', 'LGPL2', 'LGPL3', 'BSD', 'MIT', 'ARTISTIC'],
        complete: ['any', 'all', 'regex'],
        mode: ['hex', 'rgb'],
        size: ['fit', 'orig'],
        orient: ['hor', 'vert', 'horizontal', 'vertical'],
        justify: ['left', 'right', 'center', 'fill'],
        align: ['left', 'center', 'right'],
        'grid-lines': ['hor', 'vert', 'both'],
        ellipsize: ['none', 'start', 'middle', 'end']
    },
    FORCE_REPEATABLE = new Set([
        'button',
        'field',
        'column',
        'tab',
        'bar',
        'mark',
        'file-filter',
        'mime-filter',
        'image-path',
        'wk-prop'
    ]);
