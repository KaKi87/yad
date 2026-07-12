# AGENTS.md

## Cursor Cloud specific instructions

### What this project is
YAD (Yet Another Dialog) is a single C / GTK+3 command-line tool that renders GTK
dialogs from shell scripts. It is **not** a client/server app: there are no
databases, web servers, ports, or background daemons. "Running the app" means
building the `yad` binary and launching a dialog against an X display.

Build system is **GNU Autotools**. Build scaffolding (`configure`, `Makefile`,
`build/`, `m4/`) is git-ignored and must be regenerated with `autoreconf` after a
fresh clone. Full build instructions live in `README.md`.

### Build & run (dev)
Standard flow (see `README.md`):
```
autoreconf -ivf
./configure --enable-html --enable-spell --enable-sourceview --enable-icon-browser
make -j$(nproc)
```
The update script already runs `autoreconf -ivf` on startup, so normally you only
need `./configure ... && make`. Binaries are produced in-tree: `src/yad`,
`src/yad-tools`, `src/yad-icon-browser` (no install required to test).

### Running a dialog (non-obvious)
- A live X server is available on `DISPLAY=:1` (confirm with `xdpyinfo`). GUI
  dialogs render there; the Desktop pane / `computerUse` see this same display.
- Dialogs **block** waiting for user input. When testing non-interactively,
  launch with `nohup ... &` and redirect stdout to a file, or use `--timeout=N`.
- `yad --form ... > out.txt` prints selected field values as a `|`-delimited line
  to stdout only when the user clicks the affirmative (OK/Save, exit 0) button.
  Cancel/close produce no output.
- Quirk: `yad --version` exits with a **non-zero** code (252) even on success.
- When driving dialogs via the Desktop, avoid Space/Enter on focused widgets —
  they can activate a default button and close the dialog prematurely; prefer
  direct mouse clicks.

### Lint / tests
There is **no automated test suite** and **no lint config** in this repo
(no `make check` / `TESTS`). Validation is done by building and manually running
dialogs.
