#!/usr/bin/env bun

import { join as joinPath } from 'node:path';
import { appendFile } from 'node:fs/promises';

import {
    createYad,
    buttons,
    StockButton
} from '../mod.ts';

const
    yad = createYad(),
    getHistoryPath = (() => {
        let _historyPath: string | undefined;
        return async () => {
            if(Bun.env.HISTFILE)
                return Bun.env.HISTFILE;
            if(_historyPath)
                return _historyPath;
            const
                homePath = Bun.env.HOME,
                fallbackHistoryPath = '/tmp/.yad_history';
            if(!homePath)
                return _historyPath = fallbackHistoryPath;
            const historyCandidates = [
                '.zsh_history',
                '.bash_history',
                '.history'
            ].map(_ => joinPath(homePath, _));
            for(const path of historyCandidates)
                if(await Bun.file(path).exists())
                    return _historyPath = path;
            return _historyPath = fallbackHistoryPath;
        };
    })(),
    dialogButtons = buttons.define({
        clear: buttons.dismiss({ label: 'Clear History', icon: 'gtk-clear' }),
        cancel: buttons.cancel(),
        run: buttons.submit(StockButton.execute)
    }),
    spawnDetached = (command: string[]) => void (Bun.spawn({
        cmd: command,
        stdout: 'ignore',
        stderr: 'ignore',
        stdin: 'ignore',
        detached: true
    }));

(async function main () {
    const {
        exitCode,
        value
    } = await yad.entry({
        width: 500,
        center: true,
        windowIcon: 'gtk-execute',
        title: 'Run command',
        text: 'Enter command to execute:',
        image: 'gtk-execute',
        editable: true,
        rest: await getHistoryPath(),
        buttons: dialogButtons.list
    });
    switch(dialogButtons.match(exitCode)){
        case 'clear': {
            const
                historyPath = await getHistoryPath(),
                historyFile = Bun.file(historyPath);
            await Bun.write(`${historyPath}.bak`, historyFile).catch(() => {});
            await historyFile.delete().catch(() => {});
            await yad.message({
                fixed: true,
                title: 'History',
                windowIcon: 'applications-system',
                text: 'History Cleared',
                timeout: 1,
                noButtons: true
            });
            break;
        }
        case 'run': {
            let command = value?.trim();
            if(!command) return;
            if(/^https?:\/\//.test(command))
                return spawnDetached(['xdg-open', command]);
            if(command.startsWith('mailto:'))
                return spawnDetached(['xdg-email', command]);
            if(command.startsWith('man://'))
                command = `man ${command.slice('man://'.length)}`;
            const
                commandParts = command.split(' '),
                commandNamePath = Bun.which(commandParts[0]);
            if(commandNamePath)
                command = `${commandNamePath} ${commandParts.slice(1).join(' ')}`;
            spawnDetached(['x-terminal-emulator', '-e', command]);
            return await appendFile(await getHistoryPath(), `${command}\n`);
        }
        case 'cancel':
        default: {
            return;
        }
    }
    return main();
})();