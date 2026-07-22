import { mkdir } from 'node:fs/promises';

import { buildCatalog } from './normalize.ts';
import { emitOptions } from './emit-options.ts';
import { emitSchemas } from './emit-schemas.ts';
import { emitArgs } from './emit-args.ts';
import { emitMethods } from './emit-methods.ts';
import {
    emitStock,
    emitCatalogJson
} from './emit-stock.ts';

export const
    generate = async (manSource?: string): Promise<{
        catalogPath: string;
        files: string[];
    }> => {
        const
            source = manSource ?? await Bun.file(manPath).text(),
            catalog = buildCatalog(source);

        await mkdir(outDir, { recursive: true });

        const outputs: { name: string; content: string }[] = [
            { name: 'options.ts', content: emitOptions(catalog) },
            { name: 'schemas.ts', content: emitSchemas(catalog) },
            { name: 'args.ts', content: emitArgs(catalog) },
            { name: 'methods.ts', content: emitMethods(catalog) },
            { name: 'stock.ts', content: emitStock(catalog) },
            { name: 'catalog.json', content: emitCatalogJson(catalog) }
        ];

        for(const file of outputs)
            await Bun.write(`${outDir}/${file.name}`, file.content);

        return {
            catalogPath: `${outDir}/catalog.json`,
            files: outputs.map(f => f.name)
        };
    };

const
    root = `${import.meta.dir}/../../..`,
    manPath = `${root}/data/yad.1`,
    outDir = `${import.meta.dir}/../../src/generated`;

if(import.meta.main){
    const result = await generate();
    console.log(`Generated ${result.files.join(', ')} → ${outDir}`);
}
