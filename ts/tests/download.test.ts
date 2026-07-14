import {
    afterEach,
    describe,
    expect,
    test
} from 'bun:test';
import {
    rm,
    mkdtemp,
    readFile,
    stat
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { GitHubRelease } from '../src/types/download.ts';
import {
    resolveYadArch,
    findReleaseAsset,
    assetNameForArch,
    downloadYad,
    fetchLatestRelease
} from '../src/cli/download.ts';

const
    sampleRelease: GitHubRelease = {
        tag_name: 'v15.0+git.3f08f12',
        assets: [
            {
                name: 'yad-linux-amd64',
                browser_download_url: 'https://example.com/yad-linux-amd64'
            },
            {
                name: 'yad-linux-arm64',
                browser_download_url: 'https://example.com/yad-linux-arm64'
            }
        ]
    },

    tempDirs: string[] = [];

afterEach(async () => await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))));

describe('resolveYadArch', () => {
    test('maps x64 to amd64', () => expect(resolveYadArch()).toBe(process.arch === 'arm64' ? 'arm64' : 'amd64'));

    test('accepts explicit arch', () => {
        expect(resolveYadArch('arm64')).toBe('arm64');
        expect(resolveYadArch('amd64')).toBe('amd64');
    });
});

describe('findReleaseAsset', () => {
    test('selects the asset for the requested architecture', () => expect(findReleaseAsset(sampleRelease, 'amd64')).toEqual({
        name: 'yad-linux-amd64',
        url: 'https://example.com/yad-linux-amd64'
    }));

    test('throws when the asset is missing', () => expect(() => findReleaseAsset({ tag_name: 'v0', assets: [] }, 'amd64'))
        .toThrow(/no asset named yad-linux-amd64/));
});

describe('assetNameForArch', () => test('builds expected filenames', () => {
    expect(assetNameForArch('amd64')).toBe('yad-linux-amd64');
    expect(assetNameForArch('arm64')).toBe('yad-linux-arm64');
}));

describe('downloadYad', () => {
    test('downloads into a provided directory', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'yad-download-test-'));
        tempDirs.push(directory);

        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async (input: RequestInfo | URL) => {
            const url = String(input);

            if(url.includes('api.github.com'))
                return new Response(JSON.stringify(sampleRelease), { status: 200 });

            if(url.endsWith('yad-linux-amd64'))
                return new Response(new Uint8Array([0x7f, 0x45, 0x4c, 0x46]), { status: 200 });

            return new Response('not found', { status: 404 });
        }) as typeof fetch;

        try {
            const result = await downloadYad({
                path: directory,
                arch: 'amd64',
                apiUrl: 'https://api.github.com/repos/KaKi87/yad/releases/latest'
            });

            expect(result.path).toBe(join(directory, 'yad'));
            expect(result.directory).toBe(directory);
            expect(result.version).toBe('v15.0+git.3f08f12');
            expect(result.arch).toBe('amd64');

            const file = await readFile(result.path);
            expect(file.byteLength).toBe(4);

            const mode = (await stat(result.path)).mode & 0o777;
            expect(mode).toBe(0o755);
        }
        finally {
            globalThis.fetch = originalFetch;
        }
    });

    test('uses a temporary directory when path is omitted', async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async (input: RequestInfo | URL) => {
            const url = String(input);

            if(url.includes('api.github.com'))
                return new Response(JSON.stringify(sampleRelease), { status: 200 });

            return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
        }) as typeof fetch;

        try {
            const result = await downloadYad({ arch: 'amd64' });
            tempDirs.push(result.directory);

            expect(result.path.startsWith(join(tmpdir(), 'yad-'))).toBe(true);
            expect(await stat(result.path)).toBeTruthy();
        }
        finally {
            globalThis.fetch = originalFetch;
        }
    });
});

describe('fetchLatestRelease integration', () => test('loads the latest KaKi87/yad release metadata', async () => {
    if(!process.env.YAD_DOWNLOAD_INTEGRATION)
        return;

    const
        release = await fetchLatestRelease(),
        arch = resolveYadArch(),
        asset = findReleaseAsset(release, arch);

    expect(release.tag_name).toMatch(/^v/);
    expect(asset.name).toBe(assetNameForArch(arch));
    expect(asset.url).toContain('github.com/KaKi87/yad/releases/download/');
}));
