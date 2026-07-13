export const
    resolveTestBinary = (): string | undefined =>
        process.env.YAD_BIN ?? Bun.env.YAD_BIN,

    hasDisplay = (): boolean =>
        Boolean(process.env.DISPLAY ?? Bun.env.DISPLAY),

    skipWithoutDisplay = (): boolean => {
        if(!hasDisplay()){
            console.warn('Skipping GUI test: DISPLAY not set');
            return true;
        }
        return false;
    },

    signalOk = async (pid: number, delayMs = 500): Promise<void> => {
        await Bun.sleep(delayMs);
        process.kill(pid, 'SIGUSR1');
    };
