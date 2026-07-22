import type { YadButton } from '../types/structured.ts';
import type { StockButtonId } from '../generated/stock.ts';
import { StockButton } from '../generated/stock.ts';

import {
    isReservedExitCode,
    primaryDismissCode,
    primarySubmitCode,
    printsResult,
    stockMeta
} from './stock-meta.ts';

export type ButtonRole = 'submit' | 'dismiss' | 'command';

export type CustomButtonOptions = {
    label: string;
    icon?: string;
    tooltip?: string;
};

export type CommandButtonOptions = CustomButtonOptions & {
    command: string;
};

export type DefinedButton = {
    yad: YadButton;
    exitCode: number | null;
    role: ButtonRole;
    printsResult: boolean;
};

export type ButtonSet<T extends string> = {
    /** Yad `--button` list, ready for `buttons:` options. */
    list: YadButton[];
    /** Map a dialog exit code to the defined button name. */
    match: (exitCode: number) => T | null;
    /** True when `exitCode` belongs to the named button. */
    is: (name: T, exitCode: number) => boolean;
    get: (name: T) => DefinedButton;
};

export type ButtonFactory = (allocator: Allocator) => DefinedButton;

export type { StockMeta } from './stock-meta.ts';

export {
    isReservedExitCode,
    primaryDismissCode,
    primarySubmitCode,
    printsResult,
    stockMeta
};

export const
    buttons = {
        /**
         * Affirmative button. First submit gets exit code 0 (prints result);
         * further submits get even codes 2, 4, …
         */
        submit: (
            stockOrOptions: StockButtonId | CustomButtonOptions
        ): ButtonFactory =>
            allocator => {
                if(typeof stockOrOptions === 'string'){
                    const meta = stockMeta[stockOrOptions];
                    return defineSubmit(allocator, meta.label, meta.icon);
                }

                return defineSubmit(
                    allocator,
                    stockOrOptions.label,
                    stockOrOptions.icon,
                    stockOrOptions.tooltip
                );
            },

        /**
         * Extra dismiss button with an odd exit code (3, 5, …).
         * Does not print dialog result.
         */
        dismiss: (options: CustomButtonOptions): ButtonFactory =>
            allocator => defineDismiss(
                allocator,
                options.label,
                options.icon,
                options.tooltip
            ),

        /** Stock cancel (exit code 1). */
        cancel: (stock: StockButtonId = StockButton.cancel): ButtonFactory =>
            () => defineCancel(stock),

        /**
         * Command button: `id` is a shell command; click does not close the dialog.
         */
        command: (options: CommandButtonOptions): ButtonFactory =>
            () => ({
                yad: {
                    label: options.label,
                    icon: options.icon,
                    tooltip: options.tooltip,
                    id: options.command
                },
                exitCode: null,
                role: 'command',
                printsResult: false
            }),

        define: <T extends Record<string, ButtonFactory>>(
            definitions: T
        ): ButtonSet<Extract<keyof T, string>> => {
            const
                allocator = createAllocator(),
                entries = Object.entries(definitions).map(([name, factory]) => [
                    name,
                    factory(allocator)
                ] as const),
                byName = Object.fromEntries(entries) as Record<string, DefinedButton>,
                byCode = new Map<number, string>();

            for(const [name, button] of entries)
                if(button.exitCode !== null)
                    byCode.set(button.exitCode, name);

            return {
                list: entries.map(([, button]) => button.yad),

                match: exitCode =>
                    (byCode.get(exitCode) as Extract<keyof T, string> | undefined) ?? null,

                is: (name, exitCode) => byName[name]?.exitCode === exitCode,

                get: name => byName[name]!
            };
        }
    };

type Allocator = {
    nextSubmit: number;
    nextDismiss: number;
    hasPrimarySubmit: boolean;
};

const
    createAllocator = (): Allocator => ({
        nextSubmit: 2,
        nextDismiss: 3,
        hasPrimarySubmit: false
    }),

    allocSubmitCode = (allocator: Allocator): number => {
        if(!allocator.hasPrimarySubmit){
            allocator.hasPrimarySubmit = true;
            return primarySubmitCode;
        }

        let code = allocator.nextSubmit;
        while(isReservedExitCode(code))
            code += 2;

        allocator.nextSubmit = code + 2;
        return code;
    },

    allocDismissCode = (allocator: Allocator): number => {
        let code = allocator.nextDismiss;
        while(isReservedExitCode(code))
            code += 2;

        allocator.nextDismiss = code + 2;
        return code;
    },

    toYadButton = (
        exitCode: number,
        label?: string,
        icon?: string,
        tooltip?: string
    ): YadButton => ({
        label,
        icon,
        tooltip,
        id: exitCode
    }),

    defineSubmit = (
        allocator: Allocator,
        label: string,
        icon?: string,
        tooltip?: string
    ): DefinedButton => {
        const exitCode = allocSubmitCode(allocator);
        return {
            yad: toYadButton(exitCode, label, icon, tooltip),
            exitCode,
            role: 'submit',
            printsResult: printsResult(exitCode)
        };
    },

    defineDismiss = (
        allocator: Allocator,
        label: string,
        icon?: string,
        tooltip?: string
    ): DefinedButton => {
        const exitCode = allocDismissCode(allocator);
        return {
            yad: toYadButton(exitCode, label, icon, tooltip),
            exitCode,
            role: 'dismiss',
            printsResult: false
        };
    },

    defineCancel = (stock: StockButtonId): DefinedButton => {
        const meta = stockMeta[stock];
        return {
            yad: toYadButton(primaryDismissCode, meta.label, meta.icon),
            exitCode: primaryDismissCode,
            role: 'dismiss',
            printsResult: false
        };
    };
