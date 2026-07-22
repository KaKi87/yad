import type {
    Catalog,
    OptionDef,
    DialogModeDef
} from './types.ts';
import {
    parseManPage,
    parseOptionSignature
} from './parse-man.ts';
import {
    SECTION_TO_GROUP,
    SKIP_FLAGS,
    DIALOG_GROUPS,
    STRUCTURED_FLAGS,
    FORCE_REPEATABLE,
    ENUM_OVERRIDES,
    EXTRA_MODES,
    KEY_OVERRIDES
} from './overrides.ts';

export const
    buildCatalog = (source: string): Catalog => {
        const
            { sections, stockItems, exitStatuses } = parseManPage(source),
            options: OptionDef[] = [],
            modeFlags = new Map<string, string>();

        for(const section of sections){
            const group = SECTION_TO_GROUP[section.name];
            if(!group)
                continue;

            for(const raw of section.options){
                const parsed = parseOptionSignature(
                    raw.signature,
                    raw.description,
                    group,
                    raw.buildGate
                );

                for(const def of parsed){
                    if(group === '_modes'){
                        modeFlags.set(def.flag, `--${def.flag}`);
                        continue;
                    }

                    if(SKIP_FLAGS.has(def.flag) && group === 'misc')
                        continue;

                    if(DIALOG_GROUPS.includes(def.flag as typeof DIALOG_GROUPS[number]) && def.valueKind === 'boolean'){
                        modeFlags.set(def.flag, `--${def.flag}`);
                        continue;
                    }

                    const structured = STRUCTURED_FLAGS[def.flag];
                    def.key = structured ?? kebabToCamel(def.flag);
                    def.structured = structured;
                    if(def.flag === 'image-path'){
                        def.structured = undefined;
                        def.key = 'imagePaths';
                    }

                    if(FORCE_REPEATABLE.has(def.flag))
                        def.repeatable = true;

                    if(ENUM_OVERRIDES[def.flag])
                        def.enumValues = ENUM_OVERRIDES[def.flag];

                    if(def.flag === 'license')
                        def.enumValues = undefined;

                    options.push(def);
                }
            }
        }

        for(const extra of EXTRA_MODES)
            if(!modeFlags.has(extra.id))
                modeFlags.set(extra.id, extra.flag);

        const
            modes: DialogModeDef[] = [
                { id: 'message', flag: null, method: 'message' },
                ...[...modeFlags.entries()]
                    .map(([id, flag]) => ({
                        id,
                        flag,
                        method: modeMethodName(id)
                    }))
                    .sort((a, b) => a.id.localeCompare(b.id))
            ],
            seen = new Map<string, OptionDef>();

        for(const opt of options.sort(compareOptions)){
            const
                key = `${opt.group}:${opt.flag}`,
                existing = seen.get(key);
            if(!existing){
                seen.set(key, opt);
                continue;
            }
            if(existing.deprecated && !opt.deprecated)
                seen.set(key, opt);
        }

        return {
            modes,
            options: [...seen.values()].sort(compareOptions),
            stockItems,
            exitStatuses
        };
    };

const
    kebabToCamel = (flag: string): string => {
        if(KEY_OVERRIDES[flag])
            return KEY_OVERRIDES[flag]!;

        return flag.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    },

    modeMethodName = (id: string): string => {
        if(id === 'appindicator')
            return 'appIndicator';
        if(id === 'text-info')
            return 'textInfo';
        return kebabToCamel(id);
    },

    compareOptions = (a: OptionDef, b: OptionDef): number => {
        const groupCmp = a.group.localeCompare(b.group);
        if(groupCmp !== 0)
            return groupCmp;
        return a.flag.localeCompare(b.flag);
    };
