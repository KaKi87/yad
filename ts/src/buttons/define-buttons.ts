import type { YadButton } from '../types/common.ts';
import type { StockButtonId } from '../types/exit-codes.ts';
import { StockButton } from '../types/exit-codes.ts';

import {
    stockMeta,
    isReservedExitCode,
    primaryDismissCode,
    primarySubmitCode,
    printsResult
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
    list: YadButton[];
    match: (exitCode: number) => T | null;
    is: (name: T, exitCode: number) => boolean;
    get: (name: T) => DefinedButton;
};

export type ButtonFactory = (allocator: {
    nextSubmit: number;
    nextDismiss: number;
    hasPrimarySubmit: boolean;
}) => DefinedButton;

export const
    buttons = {
        submit: (
            stockOrOptions: StockButtonId | CustomButtonOptions,
            options: CustomButtonOptions = stockOrOptions as CustomButtonOptions
        ) => (allocator: Allocator): DefinedButton => {
            if(typeof stockOrOptions === 'string'){
                const meta = stockMeta[stockOrOptions];
                return defineSubmit(
                    allocator,
                    options.label ?? meta.label,
                    options.icon ?? meta.icon,
                    options.tooltip
                );
            }

            return defineSubmit(
                allocator,
                stockOrOptions.label,
                stockOrOptions.icon,
                stockOrOptions.tooltip
            );
        },

        dismiss: (options: CustomButtonOptions) => (allocator: Allocator): DefinedButton =>
            defineDismiss(allocator, options.label, options.icon, options.tooltip),

        cancel: (stock: StockButtonId = StockButton.cancel) => (_allocator: Allocator): DefinedButton =>
            defineCancel(stock),

        command: (options: CommandButtonOptions) => (_allocator: Allocator): DefinedButton => ({
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

                match: (exitCode: number) => byCode.get(exitCode) as Extract<keyof T, string> | null ?? null,

                is: (name, exitCode) => byName[name]?.exitCode === exitCode,

                get: name => byName[name]
            };
        }
    };

export {
    isReservedExitCode,
    primaryDismissCode,
    primarySubmitCode,
    printsResult
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
