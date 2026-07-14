import type { YadProcess } from '../types/results.ts';
import type { DialogOptionsMap } from '../types/dialogs.ts';

export type ProgressHandle = YadProcess & {
    setPercent: (value: number, bar?: number) => Promise<void>;
    setLabel: (text: string) => Promise<void>;
    log: (text: string) => Promise<void>;
};

export type TrayHandle = YadProcess & {
    setIcon: (icon: string) => Promise<void>;
    setTooltip: (tooltip: string) => Promise<void>;
    setVisible: (visible: boolean) => Promise<void>;
    setMenu: (menu: string) => Promise<void>;
    quit: () => Promise<void>;
};

export type ProgressRunnerOptions = DialogOptionsMap['progress'] & {
    onReady?: (handle: ProgressHandle) => void | Promise<void>;
};

export type TrayRunnerOptions = DialogOptionsMap['notification'] & {
    onReady?: (handle: TrayHandle) => void | Promise<void>;
};

export const
    createProgressHandle = (proc: YadProcess): ProgressHandle => ({
        ...proc,
        setPercent: async (value: number, bar?: number) => {
            const line = bar !== undefined ? `${bar}:${value}\n` : `${value}\n`;
            await proc.write(line);
        },
        setLabel: async (text: string) => await proc.write(`# ${text}\n`),
        log: async (text: string) => await proc.write(`# ${text}\n`)
    }),
    createTrayHandle = (proc: YadProcess): TrayHandle => ({
        ...proc,
        setIcon: async (icon: string) => await proc.write(`icon:${icon}\n`),
        setTooltip: async (tooltip: string) => await proc.write(`tooltip:${tooltip}\n`),
        setVisible: async (visible: boolean) => await proc.write(`visible:${visible}\n`),
        setMenu: async (menu: string) => await proc.write(`menu:${menu}\n`),
        quit: async () => await proc.write('quit\n')
    });
