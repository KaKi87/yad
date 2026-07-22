import type { StockButtonId } from '../generated/stock.ts';
import {
    STOCK_ITEMS,
    ExitCode
} from '../generated/stock.ts';

export type StockMeta = {
    label: string;
    icon: string;
    role: 'submit' | 'dismiss';
};

export const
    stockMeta: Record<StockButtonId, StockMeta> = Object.fromEntries(
        STOCK_ITEMS.map(item => [
            item.id,
            {
                label: item.label,
                icon: item.icon,
                role: ([
                    'yad-about',
                    'yad-cancel',
                    'yad-clear',
                    'yad-close',
                    'yad-no',
                    'yad-quit',
                    'yad-remove'
                ] as StockButtonId[]).includes(item.id)
                    ? 'dismiss'
                    : 'submit'
            } satisfies StockMeta
        ])
    ) as Record<StockButtonId, StockMeta>,

    primarySubmitCode = ExitCode.ok,

    primaryDismissCode = ExitCode.cancel,

    isReservedExitCode = (code: number): boolean =>
        code === ExitCode.ok
        || code === ExitCode.cancel
        || code === ExitCode.timeout
        || code === ExitCode.escape,

    /** Even codes (and OK) print stdout; odd codes do not. */
    printsResult = (code: number): boolean =>
        code === ExitCode.ok
        || (code % 2 === 0 && !isReservedExitCode(code));
