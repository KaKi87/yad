import type {
    StockItem,
    ExitStatus,
    OptionDef,
    ValueKind
} from './types.ts';

export type ParsedSection = {
    name: string;
    options: RawOption[];
};

export type RawOption = {
    signature: string;
    description: string;
    buildGate?: string;
};

export const
    parseManPage = (source: string): {
        sections: ParsedSection[];
        stockItems: StockItem[];
        exitStatuses: ExitStatus[];
    } => {
        const
            buckets = splitSections(source),
            optionsBucket = buckets.find(b => b.sh === 'OPTIONS'),
            sections = optionsBucket?.ss ?? [];

        return {
            sections,
            stockItems: parseStockItems(source),
            exitStatuses: parseExitStatuses(source)
        };
    },

    parseOptionSignature = (
        signature: string,
        description: string,
        group: string,
        buildGate?: string
    ): OptionDef[] => {
        const
            deprecated = /\(Deprecated\)/i.test(signature),
            cleaned = stripInlineMarkup(signature.replace(/\s*\(Deprecated\)\s*/i, '')),
            parts = splitAliasSignatures(cleaned),
            descPlain = stripInlineMarkup(description),
            repeatable = /may be used multipl(?:e|y) times/i.test(descPlain)
                || /can be used multiple times/i.test(descPlain),
            defs: OptionDef[] = [];

        for(const part of parts){
            const parsed = parseSingleSignature(part);
            if(!parsed)
                continue;

            const
                enumValues = extractEnumValues(descPlain),
                defaultValue = extractDefault(descPlain);

            defs.push({
                flag: parsed.flag,
                aliases: [],
                key: '',
                group,
                valueKind: parsed.valueKind,
                placeholder: parsed.placeholder,
                repeatable,
                deprecated,
                enumValues: enumValues.length > 0 ? enumValues : undefined,
                defaultValue,
                buildGate,
                description: descPlain.replace(/\s+/g, ' ').trim()
            });
        }

        if(defs.length > 1){
            const [primary, ...rest] = defs;
            primary!.aliases = rest.map(d => d.flag);
            return [primary!];
        }

        return defs;
    };

const
    NUMBER_PLACEHOLDERS = new Set([
        'NUMBER', 'NUM', 'WIDTH', 'HEIGHT', 'TIMEOUT', 'KEY', 'DAY', 'MONTH',
        'YEAR', 'POS', 'PANE', 'PERCENT', 'SIZE', 'COLUMNS', 'VALUE'
    ]),

    stripInlineMarkup = (text: string): string =>
        text
            .replace(/\\f[IBP]/g, '')
            .replace(/\\-/g, '-')
            .replace(/\\&/g, '')
            .replace(/\\e/g, '\\')
            .trim(),

    isMacro = (line: string): boolean =>
        line.startsWith('.') && !line.startsWith('.\\'),

    isBareOptionLine = (line: string): boolean =>
        /^\\?-\\-[A-Za-z]/.test(line) && !isMacro(line),

    peekIsNewOption = (lines: string[], from: number): boolean => {
        for(let i = from; i < Math.min(from + 3, lines.length); i++){
            const line = lines[i]!;
            if(line === '' || line === '.PP')
                continue;
            if(line === '.TP' || line.startsWith('.B \\-\\-') || isBareOptionLine(line))
                return true;
            return false;
        }
        return false;
    },

    readOptionRecord = (
        lines: string[],
        index: number,
        hasTp: boolean
    ): { option: RawOption | null; nextIndex: number } => {
        let i = index;
        if(hasTp)
            i++;

        while(i < lines.length && lines[i] === '')
            i++;

        if(i >= lines.length)
            return { option: null, nextIndex: index };

        let signatureLine = lines[i]!;

        if(signatureLine.startsWith('.B '))
            signatureLine = signatureLine.slice(3);
        else if(isMacro(signatureLine) && !isBareOptionLine(signatureLine))
            return { option: null, nextIndex: index };

        if(!/\\?-\\-/.test(signatureLine) && !/^-\?/.test(signatureLine))
            return { option: null, nextIndex: index };

        i++;
        const descLines: string[] = [];
        while(i < lines.length){
            const line = lines[i]!;
            if(
                line === '.TP'
                ||
                line.startsWith('.SS ')
                ||
                line.startsWith('.SH ')
                ||
                line.startsWith('.PP') && descLines.length > 0 && peekIsNewOption(lines, i + 1)
            )
                break;

            if(line === '.br'){
                descLines.push('\n');
                i++;
                continue;
            }

            if(isMacro(line) && !line.startsWith('.B ') && !line.startsWith('.I ')){
                if(['.IP', '.PP', '.RS', '.RE'].includes(line.split(' ')[0]!)){
                    i++;
                    continue;
                }
                if(line.startsWith('.TS') || line.startsWith('.TE'))
                    break;
            }

            if(isBareOptionLine(line) && descLines.length > 0)
                break;

            descLines.push(line);
            i++;
        }

        return {
            option: {
                signature: signatureLine,
                description: descLines.join(' ')
            },
            nextIndex: i - 1
        };
    },

    tagBuildGate = (
        lines: string[],
        start: number,
        section: ParsedSection,
        gate: string
    ): number => {
        let i = start;
        while(i < lines.length){
            const line = lines[i]!;
            if(line.startsWith('.SS ') || line.startsWith('.SH '))
                return i - 1;

            if(line === '.TP' || isBareOptionLine(line)){
                const raw = readOptionRecord(lines, i, line === '.TP');
                if(raw.option){
                    raw.option.buildGate = gate;
                    section.options.push(raw.option);
                    i = raw.nextIndex;
                    continue;
                }
            }
            i++;
        }
        return i;
    },

    splitSections = (source: string): { sh: string; ss: ParsedSection[] }[] => {
        const
            lines = source.split('\n'),
            result: { sh: string; ss: ParsedSection[] }[] = [];
        let
            currentSh = '',
            currentSs: ParsedSection | null = null,
            shBucket: { sh: string; ss: ParsedSection[] } | null = null;

        const flushSs = () => {
            if(currentSs && shBucket)
                shBucket.ss.push(currentSs);
            currentSs = null;
        };

        for(let i = 0; i < lines.length; i++){
            const line = lines[i]!;

            if(line.startsWith('.SH ')){
                flushSs();
                if(shBucket)
                    result.push(shBucket);
                currentSh = stripInlineMarkup(line.slice(4));
                shBucket = { sh: currentSh, ss: [] };
                continue;
            }

            if(line.startsWith('.SS ')){
                flushSs();
                currentSs = { name: stripInlineMarkup(line.slice(4)), options: [] };
                continue;
            }

            if(!shBucket)
                continue;

            if(currentSh === 'OPTIONS' && currentSs)
                if(line === '.TP' || isBareOptionLine(line)){
                    const raw = readOptionRecord(lines, i, line === '.TP');
                    if(raw.option){
                        currentSs.options.push(raw.option);
                        i = raw.nextIndex;
                    }
                }
                else if(/^Next options works only if/i.test(stripInlineMarkup(line))){
                    const gate = /GtkSourceView/i.test(line) ? 'sourceview' : 'unknown';
                    i = tagBuildGate(lines, i + 1, currentSs, gate);
                }
        }

        flushSs();
        if(shBucket)
            result.push(shBucket);

        return result;
    },

    splitAliasSignatures = (cleaned: string): string[] => {
        if(/\s\|\s/.test(cleaned))
            return cleaned.split(/\s\|\s/).map(s => s.trim());

        if(/,\s*\\?--/.test(cleaned) || /,\s*--/.test(cleaned))
            return cleaned.split(/,\s*/).map(s => s.trim());

        return [cleaned];
    },

    parseSingleSignature = (
        part: string
    ): { flag: string; valueKind: ValueKind; placeholder?: string } | null => {
        const long = part.match(/--([A-Za-z0-9][A-Za-z0-9-]*)/);
        if(!long)
            return null;

        const
            flag = long[1]!,
            attachedOptional = part.match(/--[A-Za-z0-9-]+\[=([^\]]+)\]/);
        if(attachedOptional)
            return {
                flag,
                valueKind: 'optionalString',
                placeholder: attachedOptional[1]
            };

        const bracketOptional = part.match(/--[A-Za-z0-9-]+=\[([^\]]+)\]/);
        if(bracketOptional)
            return {
                flag,
                valueKind: 'optionalString',
                placeholder: bracketOptional[1]
            };

        const required = part.match(/--[A-Za-z0-9-]+=([^\s|,]+)/);
        if(required){
            const placeholder = required[1]!.replace(/^\[|\]$/g, '');
            return {
                flag,
                valueKind: inferValueKind(placeholder),
                placeholder
            };
        }

        return { flag, valueKind: 'boolean' };
    },

    inferValueKind = (placeholder: string): ValueKind => {
        const upper = placeholder.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if(NUMBER_PLACEHOLDERS.has(upper) || /^(NUM|NUMBER)/.test(upper))
            return 'number';
        return 'string';
    },

    extractEnumValues = (description: string): string[] => {
        const patterns = [
            /Possible\s+\w+\s+are[:\s]+(.+?)(?:\.|$)/i,
            /Positions?\s+are[:\s]+(.+?)(?:\.|$)/i,
            /can be one of(?:\s+the)?\s+(.+?)(?:\.|$)/i,
            /(?:TYPE|MODE|POSITION|VALUE)\s+(?:may|can)\s+be(?:\s+in)?\s+(.+?)(?:\.|$)/i,
            /Available values are\s+(.+?)(?:\.|$)/i,
            /predefined licenses are\s+(.+?)(?:\.|$)/i
        ];

        for(const pattern of patterns){
            const match = description.match(pattern);
            if(!match)
                continue;

            const
                chunk = match[1]!,
                values = [...chunk.matchAll(/\b([a-zA-Z0-9][a-zA-Z0-9_-]*)\b/g)]
                    .map(m => m[1]!)
                    .filter(v => !['or', 'and', 'the', 'one', 'of', 'in', 'a', 'an', 'for', 'with', 'from'].includes(v.toLowerCase())),
                filtered = values.filter(v =>
                    v.length === 1
                    || !/^(TYPE|MODE|POSITION|VALUE|STRING|NUMBER|FILENAME|TEXT|CMD|PATH)$/i.test(v)
                );

            if(filtered.length >= 2)
                return [...new Set(filtered)];
        }

        if(/boolean values/i.test(description)){
            const letters = [...description.matchAll(/\b([TtYyOo1])\b/g)].map(m => m[1]!);
            if(letters.length >= 2)
                return [...new Set(letters)];
        }

        return [];
    },

    extractDefault = (description: string): string | undefined => {
        const match = description.match(/Default(?:\s+is|\s+value\s+(?:of\s+\w+\s+)?is)?\s+(\S+)/i);
        if(!match)
            return undefined;
        return match[1]!.replace(/[.,;]$/, '').replace(/^`|`$/g, '');
    },

    parseStockItems = (source: string): StockItem[] => {
        const
            start = source.indexOf('.SH STOCK ITEMS'),
            end = source.indexOf('.SH ', start + 1);
        if(start < 0)
            return [];

        const
            block = source.slice(start, end > 0 ? end : undefined),
            items: StockItem[] = [];

        for(const line of block.split('\n')){
            if(!line.includes('@') || line.startsWith('.') || line === '_' || line.startsWith('ID@'))
                continue;
            const [id, label, icon] = line.split('@');
            if(id?.startsWith('yad-') && label && icon)
                items.push({ id, label, icon });
        }

        return items.sort((a, b) => a.id.localeCompare(b.id));
    },

    parseExitStatuses = (source: string): ExitStatus[] => {
        const
            start = source.indexOf('.SH EXIT STATUS'),
            end = source.indexOf('.SH ', start + 1);
        if(start < 0)
            return [];

        const
            block = source.slice(start, end > 0 ? end : undefined),
            lines = block.split('\n'),
            statuses: ExitStatus[] = [];

        for(let i = 0; i < lines.length; i++){
            if(lines[i] !== '.TP')
                continue;
            const codeLine = lines[i + 1];
            if(!codeLine?.startsWith('.B '))
                continue;
            const code = Number(codeLine.slice(3).trim());
            if(Number.isNaN(code))
                continue;
            const descParts: string[] = [];
            for(let j = i + 2; j < lines.length; j++){
                const line = lines[j]!;
                if(line === '.TP' || line.startsWith('.SH'))
                    break;
                if(!isMacro(line))
                    descParts.push(line);
            }
            statuses.push({
                code,
                description: stripInlineMarkup(descParts.join(' ')).replace(/\s+/g, ' ').trim()
            });
        }

        return statuses.sort((a, b) => a.code - b.code);
    };
