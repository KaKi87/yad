import type { StockButtonId } from '../types/exit-codes.ts';
import { ExitCode } from '../types/exit-codes.ts';

export type StockMeta = {
    label: string;
    icon: string;
    role: 'submit' | 'dismiss';
};

export const
    stockMeta: Record<StockButtonId, StockMeta> = {
        'yad-about': { label: 'About', icon: 'help-about', role: 'dismiss' },
        'yad-add': { label: 'Add', icon: 'list-add', role: 'submit' },
        'yad-apply': { label: 'Apply', icon: 'gtk-apply', role: 'submit' },
        'yad-cancel': { label: 'Cancel', icon: 'gtk-cancel', role: 'dismiss' },
        'yad-clear': { label: 'Clear', icon: 'document-clear', role: 'dismiss' },
        'yad-close': { label: 'Close', icon: 'window-close', role: 'dismiss' },
        'yad-edit': { label: 'Edit', icon: 'gtk-edit', role: 'submit' },
        'yad-execute': { label: 'Execute', icon: 'system-run', role: 'submit' },
        'yad-no': { label: 'No', icon: 'gtk-no', role: 'dismiss' },
        'yad-ok': { label: 'OK', icon: 'gtk-ok', role: 'submit' },
        'yad-open': { label: 'Open', icon: 'document-open', role: 'submit' },
        'yad-print': { label: 'Print', icon: 'document-print', role: 'submit' },
        'yad-quit': { label: 'Quit', icon: 'application-exit', role: 'dismiss' },
        'yad-refresh': { label: 'Refresh', icon: 'view-refresh', role: 'submit' },
        'yad-remove': { label: 'Remove', icon: 'list-remove', role: 'dismiss' },
        'yad-save': { label: 'Save', icon: 'document-save', role: 'submit' },
        'yad-search': { label: 'Search', icon: 'system-search', role: 'submit' },
        'yad-send': { label: 'Send', icon: 'document-send', role: 'submit' },
        'yad-settings': { label: 'Settings', icon: 'gtk-preferences', role: 'submit' },
        'yad-yes': { label: 'Yes', icon: 'gtk-yes', role: 'submit' }
    },
    primarySubmitCode = ExitCode.ok,
    primaryDismissCode = ExitCode.cancel,
    isReservedExitCode = (code: number): boolean =>
        code === ExitCode.ok
        || code === ExitCode.cancel
        || code === ExitCode.timeout
        || code === ExitCode.escape,
    printsResult = (code: number): boolean =>
        code % 2 === 0 && !isReservedExitCode(code) || code === ExitCode.ok;
