[![](https://shields.kaki87.net/badge/github.com-main-blue?style=flat&logo=github)](https://github.com/KaKi87/yad/tree/dev/ts)
[![](https://shields.kaki87.net/github/stars/KaKi87/yad)](https://github.com/KaKi87/yad/tree/dev/ts)

[![](https://shields.kaki87.net/badge/git.kaki87.net-mirror-green?style=flat&logo=forgejo)](https://git.kaki87.net/KaKi87/yad/src/branch/dev/ts)
[![](https://shields.kaki87.net/gitea/stars/KaKi87/yad?gitea_url=https%3A%2F%2Fgit.kaki87.net&logo=forgejo)](https://git.kaki87.net/KaKi87/yad/src/branch/dev/ts)

# yad.ts

TypeScript API for [YAD](https://github.com/v1cont/yad) (Yet Another Dialog) — a GTK+3 command-line tool that renders desktop dialogs from scripts.

Option types, Joi schemas, and CLI arg builders are **generated** from [`data/yad.1`](../data/yad.1). Regenerate after man-page changes with:

```bash
bun run generate
```

## Install

```bash
bun add yad.ts
```

Requires a `yad` binary on `PATH`, or pass an explicit path to `createYad`.

## Usage

```ts
import { createYad, ExitCode, StockButton } from 'yad.ts';

const yad = createYad();
// or: createYad({ path: '/usr/bin/yad' })

const result = await yad.entry({
    title: 'Name',
    entryLabel: 'Your name',
    buttons: [{ id: StockButton.ok }, { id: StockButton.cancel }]
});

if(result.ok)
    console.log(result.value);
```

### Dialog methods

| Method                                                            | yad flag                            |
|-------------------------------------------------------------------|-------------------------------------|
| `message` / `info` / `warning` / `error` / `question` / `confirm` | (default)                           |
| `about`                                                           | `--about`                           |
| `chooseApp`                                                       | `--app`                             |
| `calendar`                                                        | `--calendar`                        |
| `color`                                                           | `--color`                           |
| `dnd`                                                             | `--dnd`                             |
| `entry`                                                           | `--entry`                           |
| `icons`                                                           | `--icons`                           |
| `file`                                                            | `--file`                            |
| `font`                                                            | `--font`                            |
| `form`                                                            | `--form`                            |
| `html`                                                            | `--html`                            |
| `list`                                                            | `--list`                            |
| `notebook`                                                        | `--notebook`                        |
| `notification` / `appIndicator`                                   | `--notification` / `--appindicator` |
| `popup`                                                           | `--popup`                           |
| `print`                                                           | `--print`                           |
| `progress`                                                        | `--progress`                        |
| `scale`                                                           | `--scale`                           |
| `textInfo`                                                        | `--text-info`                       |
| `paned`                                                           | `--paned`                           |
| `picture`                                                         | `--picture`                         |

Generic escape hatches: `yad.run(mode, options)` and `yad.spawn(mode, options)`.

### Result shape

```ts
type YadDialogResult<T> = {
    exitCode: number;
    stdout: string;
    stderr: string;
    value: T | null;
    ok: boolean;
    cancelled: boolean;
    timedOut: boolean;
    escaped: boolean;
};
```

`ExitCode` mirrors the man page: `ok` (0), `cancel` (1), `timeout` (70), `escape` (252).

## Development

```bash
bun install
bun run generate   # refresh src/generated from ../data/yad.1 (+ mode methods)
bun run typecheck
bun test           # unit tests; integration needs YAD_BIN + DISPLAY
```

Per-dialog methods on `createYad()` are generated from the man-page catalog plus a small hand policy in `scripts/generate/mode-policy.ts` (run vs spawn, parsers, defaults). Convenience helpers (`info` / `warning` / `error` / `question` / `confirm`) stay hand-written.

CI builds `src/yad`, sets `YAD_BIN`, and runs tests under `xvfb-run`.
