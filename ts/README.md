[![](https://shields.kaki87.net/badge/github.com-main-blue?style=flat&logo=github)](https://github.com/KaKi87/yad/tree/dev/ts)
[![](https://shields.kaki87.net/github/stars/KaKi87/yad)](https://github.com/KaKi87/yad/tree/dev/ts)

[![](https://shields.kaki87.net/badge/git.kaki87.net-mirror-green?style=flat&logo=forgejo)](https://git.kaki87.net/KaKi87/yad/src/branch/dev/ts)
[![](https://shields.kaki87.net/gitea/stars/KaKi87/yad?gitea_url=https%3A%2F%2Fgit.kaki87.net&logo=forgejo)](https://git.kaki87.net/KaKi87/yad/src/branch/dev/ts)

# yad.ts

TypeScript API for [YAD](https://github.com/v1cont/yad) (Yet Another Dialog) — a GTK+3 command-line tool that renders desktop dialogs from scripts.

This package wraps the `yad` binary with typed options, Joi validation, structured results, and a higher-level API for building stateful desktop workflows (wizards, progress bars, system tray icons).

## Requirements

- [Bun](https://bun.sh) (runtime, package manager, test runner)
- `yad` on `PATH`, or an explicit path via `createYad({ path })`
- An X display (`DISPLAY`) for GUI dialogs

## Installation

Install using Bun from the [npmjs.com](https://www.npmjs.com/package/yad.ts) registry:

```bash
bun add yad.ts
```

You also need the `yad` binary itself — this package is a TypeScript wrapper, not a replacement for YAD. Install it from [here](../.github/README.md).

## Quick start

```ts
import { createYad } from 'yad.ts';

const yad = createYad();

const result = await yad.form({
    title: 'Sign in',
    fields: [
        { label: 'Username' },
        { label: 'Password', type: 'H' },
        { label: 'Remember me', type: 'CHK' },
    ],
});

if (result.ok) {
    console.log(result.value?.byLabel);
    // { Username: 'alice', Password: 'secret', 'Remember me': 'TRUE' }
}
```

Use a custom binary (e.g. a locally built `src/yad`):

```ts
import { createYad } from 'yad.ts';

const yad = createYad({ path: '../src/yad' });
```

Automatically download the latest release binary for the current CPU architecture into a temp directory:

```ts
import { createYad, downloadYad } from 'yad.ts';

const { path } = await downloadYad();
const yad = createYad({ path });
```

Or manually specify a path and/or architecture:

```ts
const { path } = await downloadYad({ path: '/tmp/yad-bin', arch: 'arm64' });
const yad = createYad({ path });
```

## API overview

### `createYad(options?)`

Factory that returns a `yad` instance.

| Option | Type     | Description                                                                         |
|--------|----------|-------------------------------------------------------------------------------------|
| `path` | `string` | Path to the `yad` binary. Defaults to the system-wide install (`Bun.which('yad')`). |

### `downloadYad(options?)`

Downloads the latest `yad` binary from GitHub releases.

| Option   | Type                    | Description                                                                 |
|----------|-------------------------|-----------------------------------------------------------------------------|
| `path`   | `string`                | Directory to place the `yad` executable in. Defaults to a temp directory.   |
| `apiUrl` | `string`                | Releases API URL. Defaults to `https://api.github.com/repos/KaKi87/yad/releases/latest`. |
| `arch`   | `'amd64'` \| `'arm64'`  | Override detected CPU architecture.                                         |

Returns `{ path, directory, version, arch }` where `path` is the executable to pass to `createYad({ path })`.

Every dialog method returns a `YadDialogResult<T>`:

```ts
type YadDialogResult<T> = {
    exitCode: number;
    stdout: string;
    stderr: string;
    value: T | null;      // parsed stdout when applicable
    ok: boolean;          // exit code 0
    cancelled: boolean;   // exit code 1
    timedOut: boolean;    // exit code 70
    escaped: boolean;     // exit code 252
};
```

Blocking dialogs use `run()` internally. Long-running dialogs (`progress`, `notification`, `appIndicator`, …) use `spawn()` and return a `YadProcess` handle with `write()`, `closeStdin()`, `kill()`, and `wait()`.

### Low-level dialog methods

Faithful to `yad.1` — each method maps to a `--flag` and accepts typed options for that dialog type.

| Method           | `yad` flag       | Notes                                            |
|------------------|------------------|--------------------------------------------------|
| `message()`      | *(default)*      | Plain message box                                |
| `about()`        | `--about`        |                                                  |
| `chooseApp()`    | `--app`          | Named `chooseApp` to avoid clashing with `app()` |
| `calendar()`     | `--calendar`     | Returns formatted date string                    |
| `color()`        | `--color`        | Returns color string                             |
| `dnd()`          | `--dnd`          | Spawns; returns handle                           |
| `entry()`        | `--entry`        | Text / combo / spin entry                        |
| `icons()`        | `--icons`        | Spawns; returns handle                           |
| `file()`         | `--file`         | File or directory picker                         |
| `font()`         | `--font`         | Returns parsed font result                       |
| `form()`         | `--form`         | Returns fields keyed by label                    |
| `html()`         | `--html`         | Spawns; returns handle                           |
| `list()`         | `--list`         | Returns selected rows                            |
| `notebook()`     | `--notebook`     |                                                  |
| `notification()` | `--notification` | Spawns with `--listen`                           |
| `appIndicator()` | `--appindicator` | Spawns with `--listen`                           |
| `popup()`        | `--popup`        |                                                  |
| `print()`        | `--print`        |                                                  |
| `progress()`     | `--progress`     | Spawns with stdin kept open                      |
| `scale()`        | `--scale`        | Returns numeric value                            |
| `textInfo()`     | `--text-info`    |                                                  |
| `paned()`        | `--paned`        |                                                  |
| `picture()`      | `--picture`      |                                                  |

Convenience wrappers (YAD has no `--info` / `--question` flags; these use message mode with stock icons and buttons):

- `info(text, options?)`
- `warning(text, options?)`
- `error(text, options?)`
- `question(text, options?)`
- `confirm(text, options?)`

Generic escape hatches:

- `run(mode, options)` — run any dialog and get a raw string result
- `spawn(mode, options)` — spawn any dialog and get a process handle

### Exit codes

```ts
import { ExitCode } from 'yad.ts';

ExitCode.ok       // 0   — OK pressed
ExitCode.cancel   // 1   — Cancel pressed
ExitCode.timeout  // 70  — Timeout reached
ExitCode.escape   // 252 — Escape or window close
```

Custom buttons use even exit codes to print stdout, odd codes to exit silently (per `yad.1`). Stock button IDs are available as `StockButton.ok`, `StockButton.yes`, etc.

### Validation

All options are validated with [Joi](https://joi.dev) before spawning `yad`. Invalid options throw with a descriptive message:

```ts
// throws: Invalid form options: "fields" must contain at least 1 items
await yad.form({ fields: [] });
```

### High-level API — `yad.app()`

For multi-step, stateful desktop applications:

```ts
const app = yad.app({ title: 'My App', center: true });

// Shared mutable state across steps
app.set('project', 'yad.ts');

const name = await app.prompt({ label: 'Name', default: 'Alice' });
const yes = await app.ask('Save changes?');

const data = await app.form([
    { label: 'Email', type: 'CE' },
    { label: 'Active', type: 'CHK' },
]);

const path = await app.pickFile({ title: 'Open file' });
```

#### Wizard

```ts
const { completed, state } = await app.wizard([
    { type: 'info', text: 'Welcome to the setup wizard.' },
    { type: 'prompt', label: 'Hostname', key: 'hostname' },
    {
        type: 'form',
        fields: [
            { label: 'Port', type: 'NUM' },
            { label: 'Use TLS', type: 'SW' },
        ],
    },
    { type: 'select', key: 'profile', columns: [{ name: 'Name' }], rows: [['Dev'], ['Prod']], radiolist: true },
    { type: 'confirm', text: 'Apply configuration?' },
]).run();
```

#### Progress bar

```ts
const bar = await app.runProgress({
    title: 'Installing…',
    onReady: async (p) => {
        for (let i = 0; i <= 100; i += 5) {
            await p.setPercent(i);
            await p.setLabel(`Step ${i / 5} of 20`);
            await Bun.sleep(100);
        }
        await p.closeStdin();
    },
});

await bar.wait();
```

#### System tray

```ts
const tray = await app.runTray({
    image: 'application-x-executable',
    text: 'Running in background',
    onReady: async (t) => {
        await t.setTooltip('All systems go');
        await Bun.sleep(5000);
        await t.quit();
    },
});

await tray.wait();
```

## Examples

### Form with parsed output

```ts
const result = await yad.form({
    title: 'New item',
    fields: [
        { label: 'Name' },
        { label: 'Quantity', type: 'NUM' },
        { label: 'Category', type: 'CB', items: ['A', 'B', 'C'] },
    ],
});

if (result.ok)
    console.log(result.value?.byLabel.Name);
```

### List selection

```ts
const result = await yad.list({
    title: 'Pick a fruit',
    columns: [{ name: 'Fruit' }, { name: 'Stock', type: 'NUM' }],
    rows: [['Apple', '42'], ['Banana', '17']],
    radiolist: true,
});

if (result.ok)
    console.log(result.value?.rows[0]);
```

### Long-running progress from a script

```ts
const proc = await yad.progress({ title: 'Copying files', autoClose: true });

for (let i = 0; i <= 100; i += 10) {
    await proc.write(`${i}\n`);
    await Bun.sleep(200);
}

await proc.closeStdin();
await proc.wait();
```

## Development

```bash
bun test              # unit + integration tests (needs DISPLAY)
bun run typecheck     # tsc --noEmit (editor / CI type-check only)
bun run lint          # ESLint
bun run lint:fix      # ESLint with auto-fix
```

Point tests at a specific binary:

```bash
YAD_BIN=../src/yad DISPLAY=:1 bun test
```

GUI integration tests close dialogs programmatically via `SIGUSR1` (documented in `yad.1` as “close with exit 0”).

### CI

The `.github/workflows/test.yml` workflow builds the C `yad` binary from source, then runs `bun test` under `xvfb-run` with `YAD_BIN` set to the built artifact.

## Project layout

```
ts/
├── mod.ts                 # public entry point
├── src/
│   ├── create-yad.ts      # createYad factory
│   ├── types/             # TypeScript types (dialogs, options, results)
│   ├── cli/               # arg builder, spawn, stdout parsers
│   ├── validation/        # Joi schemas
│   └── app/               # YadApp, wizard, progress/tray handles
└── tests/                 # unit + integration tests
```

## License

This project is licensed under the GPL-3.0 license, as is the parent [`v1cont/yad`](https://github.com/v1cont/yad) project.