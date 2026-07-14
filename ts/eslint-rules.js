const
    mergeConsecutiveExportConst = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require merging consecutive `export const` declarations.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                merge: 'Combine consecutive `export const` declarations into a single declaration.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,

                isExportVar = node =>
                    node?.type === 'ExportNamedDeclaration'
                    && node.declaration?.type === 'VariableDeclaration'
                    && ['const', 'let', 'var'].includes(node.declaration.kind)
                    && node.declaration.declarations?.length === 1
                    && node.specifiers?.length === 0
                    && node.source == null,

                getIndent = node => {
                    const line = sourceCode.lines[node.loc.start.line - 1] ?? '';
                    return line.match(/^\s*/)?.[0] ?? '';
                },

                mergeRun = run => {
                    const
                        first = run[0],
                        kind = first.declaration.kind,
                        indent = getIndent(first),
                        declarators = run.map(n => sourceCode.getText(n.declaration.declarations[0])),
                        merged = `${indent}export ${kind}\n${indent}    ${declarators[0]}${declarators.slice(1).map(d => `,\n${indent}    ${d}`).join('')};`;

                    context.report({
                        node: run[1],
                        messageId: 'merge',
                        fix: fixer => fixer.replaceTextRange(
                            [first.range[0], run[run.length - 1].range[1]],
                            merged
                        )
                    });
                };

            return {
                Program: program => {
                    const body = program.body;
                    let run = [];

                    for(const node of body)
                        if(isExportVar(node) && (!run.length || node.declaration.kind === run[0].declaration.kind))
                            run.push(node);
                        else {
                            if(run.length >= 2)
                                mergeRun(run);
                            run = isExportVar(node) ? [node] : [];
                        }

                    if(run.length >= 2)
                        mergeRun(run);
                }
            };
        }
    },

    EXPORT_KIND = {
        type: 0,
        const: 1,
        let: 2
    },

    isExportStatement = node =>
        node?.type === 'ExportNamedDeclaration'
        || node?.type === 'ExportDefaultDeclaration'
        || node?.type === 'ExportAllDeclaration',

    getExportKind = node => {
        if(node.type === 'ExportAllDeclaration')
            return { rank: EXPORT_KIND.const, label: 'value' };

        if(node.type === 'ExportDefaultDeclaration')
            return { rank: EXPORT_KIND.const, label: 'default' };

        if(node.exportKind === 'type')
            return { rank: EXPORT_KIND.type, label: 'type' };

        const { declaration } = node;

        if(declaration?.type === 'TSTypeAliasDeclaration' || declaration?.type === 'TSInterfaceDeclaration')
            return { rank: EXPORT_KIND.type, label: 'type' };

        if(declaration?.type === 'VariableDeclaration'){
            if(declaration.kind === 'const')
                return { rank: EXPORT_KIND.const, label: 'const' };
            if(declaration.kind === 'let' || declaration.kind === 'var')
                return { rank: EXPORT_KIND.let, label: 'let' };
        }

        return { rank: EXPORT_KIND.const, label: 'value' };
    },

    getExportedBindingNames = node => {
        if(node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'VariableDeclaration')
            return [];

        return node.declaration.declarations.flatMap(declarator =>
            declarator.id.type === 'Identifier' ? [declarator.id.name] : []
        );
    },

    collectInitReferences = node => {
        const
            references = new Set(),

            visit = current => {
                if(!current || typeof current !== 'object')
                    return;

                if(current.type === 'Identifier')
                    references.add(current.name);

                for(const value of Object.values(current))
                    if(Array.isArray(value))
                        value.forEach(visit);
                    else if(value && typeof value.type === 'string')
                        visit(value);

            };

        if(node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'VariableDeclaration')
            return references;

        for(const declarator of node.declaration.declarations)
            if(declarator.init)
                visit(declarator.init);

        return references;
    },

    constReferencesPriorLet = (node, priorLetNames) => {
        if(node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'VariableDeclaration')
            return false;

        if(node.declaration.kind !== 'const')
            return false;

        const references = collectInitReferences(node);

        for(const name of priorLetNames)
            if(references.has(name))
                return true;

        return false;
    },

    exportTopAndKindOrder = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require exports at the top, grouped as `export type`, then `export const`, then `export let`.'
            },
            schema: [],
            messages: {
                codeBeforeExports: 'Non-export code must not appear before exports.',
                splitsExports: 'Non-export code must not appear between export statements.',
                exportAfterCode: 'Exports must not appear after non-export code.',
                kindOrder: 'Place `export {{kind}}` before `export {{priorKind}}` exports.'
            }
        },
        create: context => ({
            Program: program => {
                const
                    entries = program.body.filter(node => node.type !== 'ImportDeclaration'),
                    exportIndices = [];

                for(let index = 0; index < entries.length; index++)
                    if(isExportStatement(entries[index]))
                        exportIndices.push(index);

                if(!exportIndices.length)
                    return;

                const
                    firstExportIndex = exportIndices[0],
                    lastExportIndex = exportIndices[exportIndices.length - 1];

                for(let index = 0; index < firstExportIndex; index++)
                    context.report({
                        node: entries[index],
                        messageId: 'codeBeforeExports'
                    });

                for(let index = firstExportIndex + 1; index < lastExportIndex; index++)
                    if(!isExportStatement(entries[index]))
                        context.report({
                            node: entries[index],
                            messageId: 'splitsExports'
                        });

                for(let index = lastExportIndex + 1; index < entries.length; index++)
                    if(isExportStatement(entries[index]))
                        context.report({
                            node: entries[index],
                            messageId: 'exportAfterCode'
                        });

                const exportNodes = exportIndices.map(index => entries[index]);
                let
                    maxRank = -1,
                    maxRankLabel = '',
                    priorLetNames = new Set();

                for(const node of exportNodes){
                    const { rank, label } = getExportKind(node);

                    if(rank < maxRank && !(rank === EXPORT_KIND.const && maxRank === EXPORT_KIND.let && constReferencesPriorLet(node, priorLetNames)))
                        context.report({
                            node,
                            messageId: 'kindOrder',
                            data: {
                                kind: label,
                                priorKind: maxRankLabel
                            }
                        });

                    if(rank >= maxRank){
                        maxRank = rank;
                        maxRankLabel = label;
                    }

                    if(label === 'let')
                        for(const name of getExportedBindingNames(node))
                            priorLetNames.add(name);

                }
            }
        })
    },

    newlineAfterVarKind = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require `const`/`let`/`var` to place the first declarator on the next line.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                newline: 'Put the first declarator on a new line under the declaration keyword.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,

                getLineIndent = lineIndex0 => (sourceCode.lines[lineIndex0] ?? '').match(/^\s*/)?.[0] ?? '',

                checkVarDecl = variableDeclaration => {
                    if(variableDeclaration.declarations.length < 2)
                        return;

                    const
                        kindToken = sourceCode.getFirstToken(variableDeclaration),
                        firstDeclaratorToken = sourceCode.getFirstToken(variableDeclaration.declarations[0]);
                    if(!kindToken || !firstDeclaratorToken)
                        return;

                    if(kindToken.loc.end.line !== firstDeclaratorToken.loc.start.line)
                        return;

                    const
                        indent = getLineIndent(variableDeclaration.loc.start.line - 1),
                        replacement = `\n${indent}    `;

                    context.report({
                        node: variableDeclaration.declarations[0],
                        messageId: 'newline',
                        fix: fixer => fixer.replaceTextRange([kindToken.range[1], firstDeclaratorToken.range[0]], replacement)
                    });
                };

            return {
                VariableDeclaration: checkVarDecl
            };
        }
    },

    spaceBeforeElseCatchDoBraces = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require a space before `{` after `else`, `finally`, and `do`.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                missing: 'Add a space before `{` after `{{keyword}}`.',
                extra: 'Remove the space before `{` after `{{keyword}}`.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,

                checkBlock = (block, keyword) => {
                    const
                        brace = sourceCode.getFirstToken(block),
                        keywordToken = sourceCode.getTokenBefore(brace, {
                            filter: token => token.type === 'Keyword' && token.value === keyword
                        });

                    if(!brace || !keywordToken || keywordToken.loc.end.line !== brace.loc.start.line)
                        return;

                    const between = sourceCode.text.slice(keywordToken.range[1], brace.range[0]);

                    if(between === ' ')
                        return;

                    context.report({
                        node: block,
                        messageId: between === '' ? 'missing' : 'extra',
                        data: { keyword },
                        fix: fixer => fixer.replaceTextRange(
                            [keywordToken.range[1], brace.range[0]],
                            ' '
                        )
                    });
                },

                checkColonBeforeBlock = block => {
                    const
                        brace = sourceCode.getFirstToken(block),
                        colon = sourceCode.getTokenBefore(brace, {
                            filter: token => token.value === ':'
                        });

                    if(!brace || !colon || colon.loc.end.line !== brace.loc.start.line)
                        return;

                    const between = sourceCode.text.slice(colon.range[1], brace.range[0]);

                    if(between === ' ')
                        return;

                    context.report({
                        node: block,
                        messageId: between === '' ? 'missing' : 'extra',
                        data: { keyword: 'case' },
                        fix: fixer => fixer.replaceTextRange(
                            [colon.range[1], brace.range[0]],
                            ' '
                        )
                    });
                };

            return {
                IfStatement: node => {
                    if(node.alternate?.type === 'BlockStatement')
                        checkBlock(node.alternate, 'else');
                },
                TryStatement: node => {
                    if(node.finalizer)
                        checkBlock(node.finalizer, 'finally');
                },
                DoWhileStatement: node => {
                    if(node.body.type === 'BlockStatement')
                        checkBlock(node.body, 'do');
                },
                SwitchCase: node => {
                    if(node.consequent.length === 1 && node.consequent[0].type === 'BlockStatement')
                        checkColonBeforeBlock(node.consequent[0]);
                }
            };
        }
    },

    getTernaryQuestionToken = (node, sourceCode) =>
        sourceCode.getFirstTokenBetween(node.test, node.consequent, {
            filter: token => token.value === '?'
        })
        ?? sourceCode.getTokenBefore(node.consequent, {
            filter: token => token.value === '?'
        }),

    getTernaryColonToken = (node, sourceCode) =>
        sourceCode.getLastTokenBetween(node.consequent, node.alternate, {
            filter: token => token.value === ':'
        })
        ?? sourceCode.getTokenBefore(node.alternate, {
            filter: token => token.value === ':'
        }),

    getTernaryChainRoot = node => {
        let current = node;

        while(current.parent?.type === 'ConditionalExpression' && current.parent.alternate === current)
            current = current.parent;

        return current;
    },

    isPatternMatchingChain = (root, sourceCode) => {
        if(root.loc.start.line === root.loc.end.line)
            return false;

        const question = getTernaryQuestionToken(root, sourceCode);

        if(!question || question.loc.start.line !== root.test.loc.end.line)
            return false;

        if(root.alternate.loc.start.line <= question.loc.start.line)
            return false;

        let current = root;

        while(current.alternate?.type === 'ConditionalExpression'){
            const
                colon = getTernaryColonToken(current, sourceCode),
                inner = current.alternate,
                innerQuestion = getTernaryQuestionToken(inner, sourceCode);

            if(!colon || !innerQuestion || innerQuestion.loc.start.line !== colon.loc.start.line)
                return false;

            current = inner;
        }

        return Boolean(getTernaryColonToken(current, sourceCode));
    },

    noMultiSpacesExceptPatternTernary = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Disallow multiple spaces except pattern-matching ternary alignment padding.'
            },
            fixable: 'whitespace',
            schema: [
                {
                    type: 'object',
                    properties: {
                        ignoreEOLComments: {
                            type: 'boolean',
                            default: false
                        }
                    },
                    additionalProperties: false
                }
            ],
            messages: {
                multipleSpaces: 'Multiple spaces found before \'{{displayValue}}\'.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,
                ignoreEOLComments = context.options[0]?.ignoreEOLComments ?? false,

                isPatternTernaryPadding = (leftToken, rightToken) =>
                    rightToken.value === '?'
                    && leftToken.loc.start.line === rightToken.loc.start.line
                    && sourceCode.lines[leftToken.loc.start.line - 1]?.includes(':');

            return {
                Program: () => {
                    const tokens = sourceCode.tokensAndComments;

                    for(let index = 0; index < tokens.length - 1; index++){
                        const
                            leftToken = tokens[index],
                            rightToken = tokens[index + 1];

                        if(
                            !sourceCode.text.slice(leftToken.range[1], rightToken.range[0]).includes('  ')
                            ||
                            leftToken.loc.end.line < rightToken.loc.start.line
                        ) continue;

                        if(
                            ignoreEOLComments
                            &&
                            rightToken.type === 'Block'
                            &&
                            (index === tokens.length - 2 || rightToken.loc.end.line < tokens[index + 2].loc.start.line)
                        ) continue;

                        if(isPatternTernaryPadding(leftToken, rightToken))
                            continue;

                        context.report({
                            node: rightToken,
                            loc: {
                                start: leftToken.loc.end,
                                end: rightToken.loc.start
                            },
                            messageId: 'multipleSpaces',
                            data: { displayValue: rightToken.value },
                            fix: fixer => fixer.replaceTextRange(
                                [leftToken.range[1], rightToken.range[0]],
                                ' '
                            )
                        });
                    }
                }
            };
        }
    },

    tokenStartsLine = (token, sourceCode) => {
        const line = sourceCode.lines[token.loc.start.line - 1] ?? '';

        return line.slice(0, token.loc.start.column - 1).trim() === '';
    },

    getLogicalRoot = node => {
        let current = node;

        while(current.parent?.type === 'LogicalExpression' && current.parent.left === current)
            current = current.parent;

        return current;
    },

    getNullishRoot = node => {
        let current = node;

        while(current.parent?.type === 'BinaryExpression'
              && current.parent.operator === '??'
              && current.parent.left === current)
            current = current.parent;

        return current;
    },

    isInsideParentheses = node => {
        let current = node.parent;

        while(current){
            if(current.type === 'ParenthesizedExpression')
                return true;

            current = current.parent;
        }

        return false;
    },

    reportTokenAlign = (token, alignColumn, sourceCode, context) => {
        const
            line = sourceCode.lines[token.loc.start.line - 1] ?? '',
            leadingLength = line.match(/^\s*/)?.[0].length ?? 0;

        if(leadingLength + 1 !== token.loc.start.column || token.loc.start.column === alignColumn)
            return;

        const lineStartIndex = sourceCode.getIndexFromLoc({ line: token.loc.start.line, column: 1 });

        context.report({
            node: token,
            messageId: 'align',
            data: { column: alignColumn },
            fix: fixer => fixer.replaceTextRange(
                [lineStartIndex, lineStartIndex + leadingLength],
                ' '.repeat(alignColumn - 1)
            )
        });
    },

    validateMultilineLogicalAlign = (node, sourceCode, context) => {
        const root = getLogicalRoot(node);

        if(root.loc.start.line === root.loc.end.line)
            return;

        const
            alignColumn = sourceCode.getFirstToken(root).loc.start.column,
            visit = expression => {
                if(expression.type !== 'LogicalExpression')
                    return;

                if(expression.parent?.type === 'ParenthesizedExpression')
                    return;

                if(expression.loc.start.line === expression.loc.end.line)
                    return;

                visit(expression.left);
                visit(expression.right);

                const operatorToken = sourceCode.getTokenBefore(expression.right, {
                    filter: token => token.value === expression.operator
                });

                if(operatorToken)
                    reportTokenAlign(operatorToken, alignColumn, sourceCode, context);

                if(
                    expression.right.loc.start.line > expression.left.loc.end.line
                    &&
                    expression.right.type !== 'LogicalExpression'
                    ||
                    expression.right.loc.start.line !== expression.right.loc.end.line
                )
                    reportTokenAlign(sourceCode.getFirstToken(expression.right), alignColumn, sourceCode, context);
            };

        visit(root);
    },

    validateMultilineNullishAlign = (node, sourceCode, context) => {
        const root = getNullishRoot(node);

        if(root.loc.start.line === root.loc.end.line)
            return;

        const
            alignColumn = sourceCode.getFirstToken(root).loc.start.column,
            visit = expression => {
                if(expression.type !== 'BinaryExpression' || expression.operator !== '??')
                    return;

                visit(expression.left);
                visit(expression.right);

                const operatorToken = sourceCode.getTokenBefore(expression.right, {
                    filter: token => token.value === '??'
                });

                if(operatorToken)
                    reportTokenAlign(operatorToken, alignColumn, sourceCode, context);

                if(
                    expression.right.loc.start.line > expression.left.loc.end.line
                    &&
                    expression.right.type !== 'BinaryExpression'
                    ||
                    expression.right.loc.start.line !== expression.right.loc.end.line
                )
                    reportTokenAlign(sourceCode.getFirstToken(expression.right), alignColumn, sourceCode, context);
            };

        visit(root);
    },

    getTernaryAlignColumn = (expression, sourceCode) => {
        const testFirst = sourceCode.getFirstToken(expression.test);

        if(tokenStartsLine(testFirst, sourceCode))
            return testFirst.loc.start.column;

        const lineIndent = (sourceCode.lines[expression.loc.start.line - 1] ?? '').match(/^\s*/)?.[0].length ?? 0;

        return lineIndent + 4 + 1;
    },

    validateStandardTernaryAlign = (node, sourceCode, context) => {
        const visit = expression => {
            const
                alignColumn = getTernaryAlignColumn(expression, sourceCode),
                question = getTernaryQuestionToken(expression, sourceCode),
                colon = getTernaryColonToken(expression, sourceCode);

            if(question)
                reportTokenAlign(question, alignColumn, sourceCode, context);

            if(colon)
                reportTokenAlign(colon, alignColumn, sourceCode, context);

            if(expression.alternate.type === 'ConditionalExpression')
                visit(expression.alternate);
        };

        visit(node);
    },

    multilineOperatorIndent = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Align continuation operators with the start of multiline logical, nullish, and standard ternary expressions.'
            },
            fixable: 'whitespace',
            schema: [],
            messages: {
                align: 'Align this token at column {{column}} with the start of the multiline expression.'
            }
        },
        create: context => {
            const sourceCode = context.sourceCode;

            return {
                LogicalExpression: node => {
                    if(isInsideParentheses(node))
                        return;

                    const root = getLogicalRoot(node);

                    if(root !== node)
                        return;

                    validateMultilineLogicalAlign(node, sourceCode, context);
                },

                BinaryExpression: node => {
                    if(node.operator !== '??')
                        return;

                    const root = getNullishRoot(node);

                    if(root !== node)
                        return;

                    validateMultilineNullishAlign(node, sourceCode, context);
                },

                ConditionalExpression: node => {
                    if(node.loc.start.line === node.loc.end.line)
                        return;

                    const root = getTernaryChainRoot(node);

                    if(root !== node)
                        return;

                    if(isPatternMatchingChain(root, sourceCode))
                        return;

                    validateStandardTernaryAlign(root, sourceCode, context);
                }
            };
        }
    },

    IMPORT_GROUP_PATTERNS = [
        /^(?:bun(?::|$)|node:|@std\/)/,
        /^@?\w/,
        /^\.\.(?:\/|$)/,
        /^\.\//
    ],

    getModuleGroup = modulePath => {
        for(let index = 0; index < IMPORT_GROUP_PATTERNS.length; index++)
            if(IMPORT_GROUP_PATTERNS[index].test(modulePath))
                return index;

        return IMPORT_GROUP_PATTERNS.length;
    },

    getFirstUseLine = (variable, importDecl) => {
        let first = Infinity;

        for(const reference of variable.references){
            if(reference.identifier.range[0] < importDecl.range[1])
                continue;

            const line = reference.identifier.loc.start.line;

            if(line < first)
                first = line;
        }

        return first;
    },

    getSpecifierUseLine = (importDecl, specifier, sourceCode) => {
        for(const variable of sourceCode.getDeclaredVariables(importDecl))
            if(variable.name === specifier.local.name)
                return getFirstUseLine(variable, importDecl);

        return Infinity;
    },

    sortSpecifiersByUsage = (importDecl, sourceCode) => {
        const
            leading = [],
            named = [];

        for(const specifier of importDecl.specifiers)
            if(specifier.type === 'ImportSpecifier')
                named.push(specifier);
            else
                leading.push(specifier);

        const sortedNamed = [...named].sort((left, right) => {
            const
                leftLine = getSpecifierUseLine(importDecl, left, sourceCode),
                rightLine = getSpecifierUseLine(importDecl, right, sourceCode);

            if(leftLine !== rightLine)
                return leftLine - rightLine;

            return left.range[0] - right.range[0];
        });

        return [...leading, ...sortedNamed];
    },

    formatNamedSpecifierBlock = (importDecl, specifiers, sourceCode) => {
        if(specifiers.length === 0)
            return '';

        if(specifiers.length === 1)
            return `{ ${sourceCode.getText(specifiers[0])} }`;

        const
            baseIndent = (sourceCode.lines[importDecl.loc.start.line - 1] ?? '').match(/^\s*/)?.[0] ?? '',
            innerIndent = `${baseIndent}    `;

        return `{\n${specifiers.map(specifier => `${innerIndent}${sourceCode.getText(specifier)}`).join(',\n')}\n${baseIndent}}`;
    },

    formatImportDeclaration = (importDecl, specifiers, sourceCode) => {
        const
            source = sourceCode.getText(importDecl.source),
            modulePath = importDecl.source.value,
            defaultSpecifier = specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier'),
            namespaceSpecifier = specifiers.find(specifier => specifier.type === 'ImportNamespaceSpecifier'),
            namedSpecifiers = specifiers.filter(specifier => specifier.type === 'ImportSpecifier'),
            prefix = importDecl.importKind === 'type' ? 'import type ' : 'import ',
            useBracedSingleBinding = getModuleGroup(modulePath) !== 1;

        if(specifiers.length === 0)
            return `import ${source};`;

        if(defaultSpecifier && !namespaceSpecifier && namedSpecifiers.length === 0){
            if(useBracedSingleBinding)
                return `${prefix}{ ${defaultSpecifier.local.name} } from ${source};`;

            return `${prefix}${sourceCode.getText(defaultSpecifier)} from ${source};`;
        }

        if(namespaceSpecifier && !defaultSpecifier && namedSpecifiers.length === 0)
            return `${prefix}${sourceCode.getText(namespaceSpecifier)} from ${source};`;

        const
            namedBlock = formatNamedSpecifierBlock(importDecl, namedSpecifiers, sourceCode),
            parts = [];

        if(defaultSpecifier)
            parts.push(sourceCode.getText(defaultSpecifier));

        if(namespaceSpecifier)
            parts.push(sourceCode.getText(namespaceSpecifier));

        if(namedSpecifiers.length > 0)
            parts.push(namedBlock);

        return `${prefix}${parts.join(', ')} from ${source};`;
    },

    getImportUseLine = (importDecl, sourceCode) => {
        let first = Infinity;

        for(const variable of sourceCode.getDeclaredVariables(importDecl)){
            const line = getFirstUseLine(variable, importDecl);

            if(line < first)
                first = line;
        }

        return first;
    },

    buildExpectedImportBlock = (imports, sourceCode) => {
        const grouped = new Map();

        for(const importDecl of imports){
            const group = getModuleGroup(importDecl.source.value);

            if(!grouped.has(group))
                grouped.set(group, []);

            grouped.get(group).push(importDecl);
        }

        const
            lines = [],
            groups = [...grouped.keys()].sort((left, right) => left - right);

        for(let groupIndex = 0; groupIndex < groups.length; groupIndex++){
            if(groupIndex > 0)
                lines.push('');

            const sortedImports = [...grouped.get(groups[groupIndex])].sort((left, right) => {
                const
                    leftLine = getImportUseLine(left, sourceCode),
                    rightLine = getImportUseLine(right, sourceCode);

                if(leftLine !== rightLine)
                    return leftLine - rightLine;

                return left.range[0] - right.range[0];
            });

            for(const importDecl of sortedImports)
                lines.push(formatImportDeclaration(importDecl, sortSpecifiersByUsage(importDecl, sourceCode), sourceCode));
        }

        return lines.join('\n');
    },

    importOrder = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require grouped imports with usage order inside each group and named specifier list.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                importOrder: 'Reorder imports to match group and usage order.'
            }
        },
        create: context => {
            const sourceCode = context.sourceCode;

            return {
                Program: program => {
                    const imports = program.body.filter(node => node.type === 'ImportDeclaration');

                    if(imports.length === 0)
                        return;

                    const
                        expected = buildExpectedImportBlock(imports, sourceCode),
                        actual = sourceCode.text.slice(imports[0].range[0], imports[imports.length - 1].range[1]);

                    if(expected === actual)
                        return;

                    context.report({
                        node: imports[0],
                        messageId: 'importOrder',
                        fix: fixer => fixer.replaceTextRange(
                            [imports[0].range[0], imports[imports.length - 1].range[1]],
                            expected
                        )
                    });
                }
            };
        }
    },

    ternaryLinebreak = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Enforce multiline ternary layout, with an exception for pattern-matching style.'
            },
            schema: [],
            messages: {
                patternColonAlign: 'Align `:` at column {{column}}.',
                patternQuestionAlign: 'Align `?` at column {{column}}.',
                standardQuestionLine: 'Put `?` at the beginning of a new line in multiline ternaries.',
                standardColonLine: 'Put `:` at the beginning of a new line in multiline ternaries.',
                standardTestBeforeQuestion: 'Put the test on the line(s) before `?` in multiline ternaries.',
                ambiguous: 'Use either standard multiline ternaries or pattern-matching alignment, not both.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,

                validatePatternMatching = root => {
                    const
                        question = getTernaryQuestionToken(root, sourceCode),
                        questionColumn = question.loc.start.column;
                    let current = root;

                    while(current.alternate?.type === 'ConditionalExpression'){
                        const
                            colon = getTernaryColonToken(current, sourceCode),
                            inner = current.alternate,
                            innerQuestion = getTernaryQuestionToken(inner, sourceCode),
                            middleColonColumn = inner.test.loc.start.column - 2;

                        if(colon.loc.start.column !== middleColonColumn)
                            context.report({
                                node: colon,
                                messageId: 'patternColonAlign',
                                data: { column: middleColonColumn }
                            });

                        if(innerQuestion.loc.start.column !== questionColumn)
                            context.report({
                                node: innerQuestion,
                                messageId: 'patternQuestionAlign',
                                data: { column: questionColumn }
                            });

                        current = inner;
                    }

                    const finalColon = getTernaryColonToken(current, sourceCode);

                    if(finalColon && finalColon.loc.start.column !== questionColumn)
                        context.report({
                            node: finalColon,
                            messageId: 'patternColonAlign',
                            data: { column: questionColumn }
                        });

                },

                validateStandard = root => {
                    const visit = (node, isRoot) => {
                        const
                            question = getTernaryQuestionToken(node, sourceCode),
                            colon = getTernaryColonToken(node, sourceCode);

                        if(!question || !colon)
                            return;

                        if(isRoot){
                            if(
                                question.loc.start.line === node.test.loc.end.line
                                &&
                                question.loc.start.line === node.test.loc.start.line
                            )
                                context.report({
                                    node: question,
                                    messageId: 'standardTestBeforeQuestion'
                                });

                            else if(node.test.loc.end.line >= question.loc.start.line)
                                context.report({
                                    node: question,
                                    messageId: 'standardTestBeforeQuestion'
                                });

                            if(!tokenStartsLine(question, sourceCode))
                                context.report({
                                    node: question,
                                    messageId: 'standardQuestionLine'
                                });

                            if(!tokenStartsLine(colon, sourceCode))
                                context.report({
                                    node: colon,
                                    messageId: 'standardColonLine'
                                });

                        }
                        else {
                            if(!tokenStartsLine(colon, sourceCode))
                                context.report({
                                    node: colon,
                                    messageId: 'standardColonLine'
                                });

                            if(question.loc.start.line <= node.test.loc.end.line)
                                context.report({
                                    node: question,
                                    messageId: 'standardQuestionLine'
                                });

                            if(!tokenStartsLine(question, sourceCode))
                                context.report({
                                    node: question,
                                    messageId: 'standardQuestionLine'
                                });

                        }

                        if(node.alternate.type === 'ConditionalExpression')
                            visit(node.alternate, false);
                    };

                    visit(root, true);
                };

            return {
                ConditionalExpression: node => {
                    const root = getTernaryChainRoot(node);

                    if(root !== node || root.loc.start.line === root.loc.end.line)
                        return;

                    const question = getTernaryQuestionToken(root, sourceCode);

                    if(!question)
                        return;

                    if(isPatternMatchingChain(root, sourceCode))
                        validatePatternMatching(root);

                    else if(question.loc.start.line === root.test.loc.end.line)
                        context.report({
                            node: root,
                            messageId: 'ambiguous'
                        });

                    else
                        validateStandard(root);
                }
            };
        }
    },

    isVoidReturnType = node =>
        node.returnType?.typeAnnotation?.type === 'TSVoidKeyword',

    isVoidExpression = expression =>
        expression.type === 'UnaryExpression' && expression.operator === 'void',

    isVoidWrappedWithParens = (expression, sourceCode) => {
        if(!isVoidExpression(expression))
            return false;

        const voidToken = sourceCode.getFirstToken(expression);

        return sourceCode.getTokenAfter(voidToken)?.value === '(';
    },

    isUndefinedExpression = expression =>
        (expression.type === 'Literal' && expression.value === undefined)
        || (expression.type === 'Identifier' && expression.name === 'undefined'),

    formatVoidWrap = (expression, sourceCode) => {
        const text = isVoidExpression(expression)
            ? sourceCode.getText(expression.argument)
            : sourceCode.getText(expression);

        return `void (${text})`;
    },

    changesVoidSignature = (context, arrowNode, expression) => {
        if(!isVoidReturnType(arrowNode))
            return false;

        const sourceCode = context.sourceCode;

        if(isVoidWrappedWithParens(expression, sourceCode) || isUndefinedExpression(expression))
            return false;

        if(isVoidExpression(expression))
            return true;

        if(expression.type === 'AssignmentExpression' || expression.type === 'CallExpression')
            return true;

        const
            { program, esTreeNodeToTSNode } = context.sourceCode.parserServices ?? {},
            checker = program?.getTypeChecker();

        if(checker && esTreeNodeToTSNode){
            const exprType = checker.getTypeAtLocation(esTreeNodeToTSNode(expression));

            return !checker.isTypeAssignableTo(exprType, checker.getVoidType());
        }

        return false;
    },

    formatConciseExpression = (context, arrowNode, expression, sourceCode) => {
        const text = changesVoidSignature(context, arrowNode, expression)
            ? formatVoidWrap(expression, sourceCode)
            : sourceCode.getText(expression);

        return ` ${text}`;
    },

    conciseArrowBody = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Disallow block bodies on arrow functions with a single expression statement, and require `void` when a concise body would change a `: void` signature.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                concise: 'Remove braces around the single expression in this arrow function body.',
                voidWrap: 'Wrap the expression with `void` to preserve the `: void` return type.'
            }
        },
        create: context => {
            const
                sourceCode = context.sourceCode,

                reportConciseBody = (arrowNode, expression, bodyNode, messageId = 'concise') => {
                    const arrow = sourceCode.getTokenBefore(bodyNode, {
                        filter: token => token.value === '=>'
                    });

                    if(!arrow)
                        return;

                    context.report({
                        node: bodyNode,
                        messageId,
                        fix: fixer => fixer.replaceTextRange(
                            [arrow.range[1], bodyNode.range[1]],
                            formatConciseExpression(context, arrowNode, expression, sourceCode)
                        )
                    });
                },

                reportVoidWrap = (arrowNode, expression) => context.report({
                    node: expression,
                    messageId: 'voidWrap',
                    fix: fixer => fixer.replaceText(
                        expression,
                        formatVoidWrap(expression, sourceCode)
                    )
                });

            return {
                ArrowFunctionExpression: node => {
                    if(node.body.type !== 'BlockStatement'){
                        if(changesVoidSignature(context, node, node.body))
                            reportVoidWrap(node, node.body);

                        return;
                    }

                    const { body } = node.body;

                    if(body.length !== 1)
                        return;

                    let expression;

                    if(body[0].type === 'ExpressionStatement')
                        expression = body[0].expression;

                    else if(body[0].type === 'ReturnStatement' && body[0].argument)
                        expression = body[0].argument;

                    else
                        return;

                    reportConciseBody(node, expression, node.body);
                }
            };
        }
    },

    isLogicalOperator = operator => operator === '&&' || operator === '||',

    getIfTestParens = (node, sourceCode) => {
        const
            ifToken = sourceCode.getFirstToken(node),
            openParen = sourceCode.getTokenAfter(ifToken, { filter: token => token.value === '(' });

        if(!openParen)
            return null;

        const closeParen = sourceCode.getTokenAfter(node.test, { filter: token => token.value === ')' });

        if(!closeParen)
            return null;

        return { openParen, closeParen };
    },

    isMultilineIfLayout = (node, openParen, closeParen) =>
        openParen.loc.end.line < node.test.loc.start.line
        || node.test.loc.end.line < closeParen.loc.start.line
        || node.test.loc.start.line !== node.test.loc.end.line,

    getIfTestIndent = (node, openParen, sourceCode) => {
        if(openParen.loc.end.line < node.test.loc.start.line){
            const nextLine = sourceCode.lines[node.test.loc.start.line - 1] ?? '';

            return nextLine.match(/^\s*/)?.[0] ?? '';
        }

        const
            ifLine = sourceCode.lines[node.loc.start.line - 1] ?? '',
            ifIndent = ifLine.match(/^\s*/)?.[0] ?? '';

        return `${ifIndent}    `;
    },

    validateIfTestParenNewlines = (node, sourceCode, context) => {
        const parens = getIfTestParens(node, sourceCode);

        if(!parens)
            return;

        const { openParen, closeParen } = parens;

        if(!isMultilineIfLayout(node, openParen, closeParen))
            return;

        const indent = getIfTestIndent(node, openParen, sourceCode);

        if(openParen.loc.end.line >= node.test.loc.start.line)
            context.report({
                node: openParen,
                messageId: 'openParenNewline',
                fix: fixer => fixer.replaceTextRange(
                    [openParen.range[1], node.test.range[0]],
                    `\n${indent}`
                )
            });

        if(node.test.loc.end.line >= closeParen.loc.start.line)
            context.report({
                node: closeParen,
                messageId: 'closeParenNewline',
                fix: fixer => fixer.replaceTextRange(
                    [node.test.range[1], closeParen.range[0]],
                    `\n${indent}`
                )
            });
    },

    isOperatorAloneOnLine = (operatorToken, sourceCode) => {
        const line = sourceCode.lines[operatorToken.loc.start.line - 1] ?? '';

        return line.trim() === operatorToken.value;
    },

    validateMultilineLogicalInIfTest = (expression, sourceCode, context) => {
        if(isInsideParentheses(expression))
            return;

        if(expression.type !== 'LogicalExpression' || !isLogicalOperator(expression.operator))
            return;

        validateMultilineLogicalInIfTest(expression.left, sourceCode, context);
        validateMultilineLogicalInIfTest(expression.right, sourceCode, context);

        if(expression.loc.start.line === expression.loc.end.line)
            return;

        const operatorToken = sourceCode.getTokenBefore(expression.right, {
            filter: token => token.value === expression.operator
        });

        if(!operatorToken || isOperatorAloneOnLine(operatorToken, sourceCode))
            return;

        const indent = (sourceCode.lines[expression.left.loc.start.line - 1] ?? '').match(/^\s*/)?.[0] ?? '';

        context.report({
            node: operatorToken,
            messageId: 'operatorLine',
            data: { operator: expression.operator },
            fix: fixer => fixer.replaceText(
                expression,
                `${sourceCode.getText(expression.left)}\n${indent}${expression.operator}\n${indent}${sourceCode.getText(expression.right)}`
            )
        });
    },

    longIfLinebreak = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require newlines around conditions, operators, and parentheses in multiline if tests.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                operatorLine: 'Put `{{operator}}` on its own line between conditions in a multiline `if` test.',
                openParenNewline: 'Put a newline after `(` before the first condition in a multiline `if` test.',
                closeParenNewline: 'Put a newline after the last condition before `)` in a multiline `if` test.'
            }
        },
        create: context => {
            const sourceCode = context.sourceCode;

            return {
                IfStatement: node => {
                    validateIfTestParenNewlines(node, sourceCode, context);

                    if(node.test.loc.start.line === node.test.loc.end.line)
                        return;

                    validateMultilineLogicalInIfTest(node.test, sourceCode, context);
                }
            };
        }
    };

export default {
    rules: {
        'concise-arrow-body': conciseArrowBody,
        'export-top-and-kind-order': exportTopAndKindOrder,
        'import-order': importOrder,
        'long-if-linebreak': longIfLinebreak,
        'merge-consecutive-export-const': mergeConsecutiveExportConst,
        'multiline-operator-indent': multilineOperatorIndent,
        'newline-after-var-kind': newlineAfterVarKind,
        'space-before-else-catch-do-braces': spaceBeforeElseCatchDoBraces,
        'ternary-linebreak': ternaryLinebreak,
        'no-multi-spaces': noMultiSpacesExceptPatternTernary
    }
};
