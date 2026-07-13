import type {
    YadProcess,
    YadRunResult
} from '../types/results.ts';

export type SpawnOptions = {
    binary: string;
    args: string[];
    stdin?: string;
    keepStdinOpen?: boolean;
    env?: Record<string, string>;
    cwd?: string;
};

export const
    spawnYad = (options: SpawnOptions): YadProcess => {
        const
            keepOpen = options.keepStdinOpen ?? false,
            proc = Bun.spawn({
                cmd: [options.binary, ...options.args],
                stdin: keepOpen || options.stdin ? 'pipe' : 'ignore',
                stdout: 'pipe',
                stderr: 'pipe',
                env: options.env ? { ...process.env, ...options.env } : process.env,
                cwd: options.cwd
            }),
            stdinSink = proc.stdin as StdinSink | null;

        if(stdinSink && options.stdin){
            stdinSink.write(options.stdin);
            if(!keepOpen)
                stdinSink.end();
        }

        const
            write = async (data: string): Promise<void> => {
                if(!stdinSink)
                    throw new Error('stdin is not available for this process');
                stdinSink.write(data);
            },

            closeStdin = async (): Promise<void> => {
                if(stdinSink)
                    stdinSink.end();
            };

        return {
            pid: proc.pid,
            stdin: null,
            write,
            closeStdin,
            kill: (signal = 15) => proc.kill(signal),
            wait: async (): Promise<YadRunResult> => {
                const [stdout, stderr, exitCode] = await Promise.all([
                    new Response(proc.stdout).text(),
                    new Response(proc.stderr).text(),
                    proc.exited
                ]);

                return { exitCode, stdout, stderr };
            }
        };
    },

    runYad = async (options: SpawnOptions): Promise<YadRunResult> => {
        const proc = spawnYad(options);
        return proc.wait();
    },

    findYadBinary = async (customPath?: string): Promise<string> => {
        if(customPath)
            return customPath;

        const which = Bun.which('yad');
        if(which)
            return which;

        throw new Error('yad binary not found. Install yad or pass { path } to createYad().');
    };

type StdinSink = {
    write: (data: string | Uint8Array) => void;
    end: () => void;
};
