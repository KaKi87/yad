export type YadArch = 'amd64' | 'arm64';

export type DownloadYadOptions = {
    /** Directory to place the `yad` binary in. Defaults to a temporary directory. */
    path?: string;
    /** GitHub releases API URL. */
    apiUrl?: string;
    /** Override detected CPU architecture. */
    arch?: YadArch;
};

export type DownloadYadResult = {
    /** Full path to the downloaded `yad` executable. */
    path: string;
    /** Release tag from GitHub (e.g. `v15.0+git.3f08f12`). */
    version: string;
    /** Architecture of the downloaded binary. */
    arch: YadArch;
    /** Directory that contains the binary. */
    directory: string;
};

export type GitHubReleaseAsset = {
    name: string;
    browser_download_url: string;
};

export type GitHubRelease = {
    tag_name: string;
    assets: GitHubReleaseAsset[];
};

export const DEFAULT_RELEASES_API
    = 'https://api.github.com/repos/KaKi87/yad/releases/latest';
