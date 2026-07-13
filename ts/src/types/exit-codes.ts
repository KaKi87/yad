/** Documented yad exit codes (see yad.1). */
export type ExitCodeValue = typeof ExitCode[keyof typeof ExitCode];

/** Stock button IDs from yad.1. */
export type StockButtonId = typeof StockButton[keyof typeof StockButton];

export const
    ExitCode = {
        ok: 0,
        cancel: 1,
        timeout: 70,
        escape: 252
    } as const,
    StockButton = {
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
        yes: 'yad-yes'
    } as const;
