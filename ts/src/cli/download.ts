import {
    mkdtemp,
    mkdir,
    writeFile,
    chmod
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type {
    DownloadYadOptions,
    DownloadYadResult,
    GitHubRelease,
    YadArch
} from '../types/download.ts';
import { DEFAULT_RELEASES_API } from '../types/download.ts';
import { validateDownloadYadOptions } from '../validation/main.ts';

export type {
    DownloadYadOptions,
    DownloadYadResult,
    GitHubRelease,
    YadArch
};

export const
    resolveYadArch = (override?: YadArch): YadArch => {
        if(override)
            return override;

        const arch = ARCH_ALIASES[process.arch];
        if(arch)
            return arch;

        throw new Error(`Unsupported CPU architecture: ${process.arch}`);
    },

    assetNameForArch = (arch: YadArch): string =>
        `yad-linux-${arch}`,

    findReleaseAsset = (
        release: GitHubRelease,
        arch: YadArch
    ): { name: string; url: string } => {
        const
            name = assetNameForArch(arch),
            asset = release.assets.find(entry => entry.name === name);

        if(!asset)
            throw new Error(`Release ${release.tag_name} has no asset named ${name}`);

        return { name: asset.name, url: asset.browser_download_url };
    },

    fetchLatestRelease = async (
        apiUrl = DEFAULT_RELEASES_API
    ): Promise<GitHubRelease> => {
        const response = await fetch(apiUrl, {
            headers: {
                Accept: 'application/vnd.github+json',
                'User-Agent': 'yad.ts'
            }
        });

        if(!response.ok)
            throw new Error(`Failed to fetch release metadata (${response.status} ${response.statusText})`);

        return response.json() as Promise<GitHubRelease>;
    },

    downloadYad = async (
        options?: DownloadYadOptions
    ): Promise<DownloadYadResult> => {
        const
            config = validateDownloadYadOptions(options),
            arch = resolveYadArch(config.arch),
            release = await fetchLatestRelease(config.apiUrl),
            asset = findReleaseAsset(release, arch),
            directory = config.path ?? await mkdtemp(join(tmpdir(), 'yad-'));

        await mkdir(directory, { recursive: true });

        const
            binaryPath = join(directory, 'yad'),
            response = await fetch(asset.url, {
                headers: { 'User-Agent': 'yad.ts' }
            });

        if(!response.ok)
            throw new Error(`Failed to download ${asset.name} (${response.status} ${response.statusText})`);

        const bytes = new Uint8Array(await response.arrayBuffer());
        await writeFile(binaryPath, bytes, { mode: 0o755 });
        await chmod(binaryPath, 0o755);

        return {
            path: binaryPath,
            version: release.tag_name,
            arch,
            directory
        };
    };

const ARCH_ALIASES: Record<string, YadArch> = {
    amd64: 'amd64',
    x64: 'amd64',
    x86_64: 'amd64',
    arm64: 'arm64',
    aarch64: 'arm64'
};
