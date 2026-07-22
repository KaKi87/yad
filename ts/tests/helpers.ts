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

    skipWithoutBinary = (): string | undefined => {
        const binary = resolveTestBinary() ?? Bun.which('yad') ?? undefined;
        if(!binary){
            console.warn('Skipping integration test: yad binary not found (set YAD_BIN)');
            return undefined;
        }
        return binary;
    };
