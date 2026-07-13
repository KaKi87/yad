#!/usr/bin/env bun
/**
 * Applies javascript-typescript-style.mdc spacing rules to TS files.
 * Import/export layout is handled manually; this script only fixes spacing.
 * Run: cd ts && bun run format
 */

import {
    readdir,
    readFile,
    writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';

const
    ROOT = import.meta.dir.replace(/\/scripts$/, ''),
    collectTsFiles = async (dir: string): Promise<string[]> => {
        const
            entries = await readdir(dir, { withFileTypes: true }),
            files: string[] = [];

        for(const entry of entries){
            const path = join(dir, entry.name);
            if(entry.isDirectory() && entry.name !== 'node_modules')
                files.push(...await collectTsFiles(path));

            else if(entry.isFile() && entry.name.endsWith('.ts'))
                files.push(path);
        }

        return files;
    },
    fixOrphanElse = (content: string): string =>
        content.replace(/^else\b.*/gm, (line, offset, source) => {
            const
                before = source.slice(0, offset),
                matches = [...before.matchAll(/^(\s+)if\(/gm)];
            if(!matches.length)
                return line;

            const indent = matches[matches.length - 1][1];
            return `${indent}${line.trimStart()}`;
        }),
    fixNewlineBeforeElse = (content: string): string =>
        content.replace(/^([ \t]+)(else\b)/gm, (match, indent, elseKw, offset, source) => {
            const
                lineStart = source.lastIndexOf('\n', offset - 1) + 1,
                prevLineEnd = lineStart - 1;
            if(prevLineEnd < 0)
                return match;

            const
                prevLineStart = source.lastIndexOf('\n', prevLineEnd - 1) + 1,
                prevLine = source.slice(prevLineStart, prevLineEnd);

            if(!prevLine.trim() || prevLine.trimEnd().endsWith('}'))
                return match;

            return `\n${indent}${elseKw}`;
        }),
    formatContent = (content: string): string => {
        let out = content;

        out = out.replace(/\bif \(/g, 'if(');
        out = out.replace(/\bfor \(/g, 'for(');
        out = out.replace(/\bwhile \(/g, 'while(');
        out = out.replace(/\bswitch \(/g, 'switch(');
        out = out.replace(/\bcatch \(/g, 'catch(');
        out = out.replace(/else if \(/g, 'else if(');

        out = out.replace(/^(\s+)\} else\b/gm, '$1}\n$1else');
        out = out.replace(/^(\s+)\} else if\(/gm, '$1}\n$1else if(');
        out = out.replace(/^(\s+)\} catch\b/gm, '$1}\n$1catch');

        out = fixOrphanElse(out);
        out = fixNewlineBeforeElse(out);

        out = out.replace(/=>\s*\{/g, '=> {');
        out = out.replace(/(\bif\([^;{]*\))\s+\{/g, '$1{');
        out = out.replace(/(\bfor\([^;{]*\))\s+\{/g, '$1{');
        out = out.replace(/(\bswitch\([^)]*\))\s+\{/g, '$1{');
        out = out.replace(/!(?=[a-zA-Z_([])/g, '!');

        out = out.replace(/\[\s+\.\.\./g, '[...');

        return out;
    },

    args = process.argv.slice(2),
    checkOnly = args.includes('--check'),
    files = await collectTsFiles(ROOT);

let changed = 0;

for(const file of files){
    const
        original = await readFile(file, 'utf8'),
        formatted = formatContent(original);

    if(formatted !== original){
        changed++;
        if(!checkOnly)
            await writeFile(file, formatted);
        console.log(`${checkOnly ? 'needs format' : 'formatted'}: ${file.replace(`${ROOT}/`, '')}`);
    }
}

console.log(`Checked ${files.length} files.`);

if(checkOnly && changed)
    process.exitCode = 1;
