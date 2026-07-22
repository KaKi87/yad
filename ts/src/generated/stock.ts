/**
 * AUTO-GENERATED from data/yad.1 — do not edit.
 * Regenerate with: bun run generate
 */

export type StockButtonId = typeof StockButton[keyof typeof StockButton];

export type ExitCodeValue = typeof ExitCode[keyof typeof ExitCode];

/** Stock button IDs from yad.1 STOCK ITEMS. */
export const StockButton = {
    about: 'yad-about',
    add: 'yad-add',
    apply: 'yad-apply',
    cancel: 'yad-cancel',
    clear: 'yad-clear',
    close: 'yad-close',
    edit: 'yad-edit',
    execute: 'yad-execute',
    no: 'yad-no',
    ok: 'yad-ok',
    open: 'yad-open',
    print: 'yad-print',
    quit: 'yad-quit',
    refresh: 'yad-refresh',
    remove: 'yad-remove',
    save: 'yad-save',
    search: 'yad-search',
    send: 'yad-send',
    settings: 'yad-settings',
    yes: 'yad-yes',
} as const;

/** Documented yad exit codes from yad.1 EXIT STATUS. */
export const ExitCode = {
    ok: 0,
    cancel: 1,
    timeout: 70,
    escape: 252,
} as const;

export const STOCK_ITEMS = [
    {
        id: 'yad-about',
        label: 'About',
        icon: 'help-about'
    },
    {
        id: 'yad-add',
        label: 'Add',
        icon: 'list-add'
    },
    {
        id: 'yad-apply',
        label: 'Apply',
        icon: 'gtk-apply'
    },
    {
        id: 'yad-cancel',
        label: 'Cancel',
        icon: 'gtk-cancel'
    },
    {
        id: 'yad-clear',
        label: 'Clear',
        icon: 'document-clear'
    },
    {
        id: 'yad-close',
        label: 'Close',
        icon: 'window-close'
    },
    {
        id: 'yad-edit',
        label: 'Edit',
        icon: 'gtk-edit'
    },
    {
        id: 'yad-execute',
        label: 'Execute',
        icon: 'system-run'
    },
    {
        id: 'yad-no',
        label: 'No',
        icon: 'gtk-no'
    },
    {
        id: 'yad-ok',
        label: 'OK',
        icon: 'gtk-ok'
    },
    {
        id: 'yad-open',
        label: 'Open',
        icon: 'document-open'
    },
    {
        id: 'yad-print',
        label: 'Print',
        icon: 'document-print'
    },
    {
        id: 'yad-quit',
        label: 'Quit',
        icon: 'application-exit'
    },
    {
        id: 'yad-refresh',
        label: 'Refresh',
        icon: 'view-refresh'
    },
    {
        id: 'yad-remove',
        label: 'Remove',
        icon: 'list-remove'
    },
    {
        id: 'yad-save',
        label: 'Save',
        icon: 'document-save'
    },
    {
        id: 'yad-search',
        label: 'Search',
        icon: 'system-search'
    },
    {
        id: 'yad-send',
        label: 'Send',
        icon: 'document-send'
    },
    {
        id: 'yad-settings',
        label: 'Settings',
        icon: 'gtk-preferences'
    },
    {
        id: 'yad-yes',
        label: 'Yes',
        icon: 'gtk-yes'
    },
] as const;

