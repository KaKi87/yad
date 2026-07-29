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

            if(!colon || !innerQuestion)
                return false;

            // Trailing-colon arms: `cond ? value :` then next `cond ?` on the following line.
            // Leading-colon arms: `: cond ? value` with `:` and inner `?` on the same line.
            const
                trailingColonArm = colon.loc.start.line === question.loc.start.line
                    && innerQuestion.loc.start.line === colon.loc.start.line + 1
                    && inner.test.loc.start.line === innerQuestion.loc.start.line,
                leadingColonArm = innerQuestion.loc.start.line === colon.loc.start.line;

            if(!trailingColonArm && !leadingColonArm)
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

                isPatternTernaryPadding = (leftToken, rightToken) => {
                    if(leftToken.loc.start.line !== rightToken.loc.start.line)
                        return false;

                    if(rightToken.value === '?')
                        return sourceCode.lines[leftToken.loc.start.line - 1]?.includes(':')
                            || /^\s*\S.+\?\s+\S/.test(sourceCode.lines[leftToken.loc.start.line - 1] ?? '');

                    // Allow column-aligned final `:` in trailing-colon pattern-matching chains.
                    if(rightToken.value === ':'){
                        const line = sourceCode.lines[leftToken.loc.start.line - 1] ?? '';

                        return /^\s+:\s+\S/.test(line);
                    }

                    return false;
                };

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
                            index === tokens.length - 2
                            ||
                            rightToken.loc.end.line < tokens[index + 2].loc.start.line
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

        // AST `loc.column` is 0-based (ESTree).
        return line.slice(0, token.loc.start.column).trim() === '';
    },

    getLogicalRoot = node => {
        let current = node;

        while(current.parent?.type === 'LogicalExpression' && current.parent.left === current)
            current = current.parent;

        return current;
    },

    getNullishRoot = node => {
        let current = node;

        while(
            current.parent?.type === 'BinaryExpression'
            &&
            current.parent.operator === '??'
            &&
            current.parent.left === current
        ) current = current.parent;

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

        // `loc.column` is 0-based: a token after N spaces sits at column N.
        if(leadingLength !== token.loc.start.column || token.loc.start.column === alignColumn)
            return;

        const lineStartIndex = sourceCode.getIndexFromLoc({ line: token.loc.start.line, column: 0 });

        context.report({
            node: token,
            messageId: 'align',
            data: { column: alignColumn },
            fix: fixer => fixer.replaceTextRange(
                [lineStartIndex, lineStartIndex + leadingLength],
                ' '.repeat(alignColumn)
            )
        });
    },

    getLineIndent = (line, sourceCode) =>
        (sourceCode.lines[line - 1] ?? '').match(/^\s*/)?.[0].length ?? 0,

    isAssignmentLikeAncestor = node => {
        let current = node.parent;

        while(current){
            if(
                current.type === 'VariableDeclarator'
                ||
                current.type === 'AssignmentExpression'
                ||
                current.type === 'ReturnStatement'
            ) return true;

            if(
                current.type === 'Property'
                ||
                current.type === 'PropertyDefinition'
                ||
                current.type === 'ArrayExpression'
                ||
                current.type === 'CallExpression'
                ||
                current.type === 'NewExpression'
                ||
                current.type === 'LogicalExpression'
                ||
                current.type === 'BinaryExpression'
                ||
                current.type === 'ConditionalExpression'
                ||
                current.type === 'ArrowFunctionExpression'
                ||
                current.type === 'ObjectExpression'
            ) return false;

            if(
                current.type === 'TSAsExpression'
                ||
                current.type === 'TSSatisfiesExpression'
                ||
                current.type === 'TSNonNullExpression'
                ||
                current.type === 'TSTypeAssertion'
                ||
                current.type === 'ChainExpression'
                ||
                current.type === 'ParenthesizedExpression'
                ||
                current.type === 'AwaitExpression'
            ){
                current = current.parent;
                continue;
            }

            break;
        }

        return false;
    },

    isPropertyLikeAncestor = node => {
        let current = node.parent;

        while(current){
            if(current.type === 'Property' || current.type === 'PropertyDefinition')
                return true;

            if(
                current.type === 'VariableDeclarator'
                ||
                current.type === 'AssignmentExpression'
                ||
                current.type === 'ReturnStatement'
                ||
                current.type === 'ArrayExpression'
                ||
                current.type === 'CallExpression'
                ||
                current.type === 'NewExpression'
            ) return false;

            if(
                current.type === 'TSAsExpression'
                ||
                current.type === 'TSSatisfiesExpression'
                ||
                current.type === 'TSNonNullExpression'
                ||
                current.type === 'TSTypeAssertion'
                ||
                current.type === 'ChainExpression'
                ||
                current.type === 'ParenthesizedExpression'
                ||
                current.type === 'AwaitExpression'
            ){
                current = current.parent;
                continue;
            }

            break;
        }

        return false;
    },

    getOperatorAlignColumn = (root, sourceCode) => {
        const
            first = sourceCode.getFirstToken(root),
            lineIndent = getLineIndent(first.loc.start.line, sourceCode);

        if(tokenStartsLine(first, sourceCode))
            return first.loc.start.column;

        // Object properties keep `??` / `&&` under the key indent.
        if(isPropertyLikeAncestor(root))
            return lineIndent;

        // Assignments / returns indent the continuation one level.
        if(isAssignmentLikeAncestor(root))
            return lineIndent + 4;

        return lineIndent + 4;
    },

    getTernaryAlignColumn = (expression, sourceCode) => {
        const
            testFirst = sourceCode.getFirstToken(expression.test),
            // Grouping parens as `key: (` / `= (` already indent the test body;
            // anchor `?` / `:` under the opener line, not under that body.
            testParens = getParenthesizedExpressionParens(expression.test, sourceCode),
            anchorLine = testParens
                ? testParens.openParen.loc.start.line
                : testFirst.loc.start.line,
            lineIndent = getLineIndent(anchorLine, sourceCode);

        // Standard multiline ternaries always indent `?` / `:` one level
        // under the line that holds the test (whether or not the test starts that line).
        return lineIndent + 4;
    },

    isInControlStructureTest = node => {
        let current = node;

        while(current.parent){
            const parent = current.parent;

            if(
                (
                    parent.type === 'IfStatement'
                    ||
                    parent.type === 'WhileStatement'
                    ||
                    parent.type === 'DoWhileStatement'
                )
                &&
                parent.test === current
            ) return true;

            if(parent.type === 'ForStatement' && parent.test === current)
                return true;

            current = parent;
        }

        return false;
    },

    validateMultilineLogicalAlign = (node, sourceCode, context) => {
        const root = getLogicalRoot(node);

        if(root.loc.start.line === root.loc.end.line)
            return;

        // Grouping / control-test condition lists use operator-on-own-line layout.
        // Call/new argument parens (`Boolean(...)`) keep normal logical alignment.
        if(
            root.parent?.type === 'ParenthesizedExpression'
            ||
            isInControlStructureTest(root)
            ||
            (
                getParenthesizedExpressionParens(root, sourceCode)
                &&
                !isCallOrNewArgumentParens(root, sourceCode)
            )
        ) return;

        const
            alignColumn = getOperatorAlignColumn(root, sourceCode),
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

                // Only align a RHS that continues after a trailing operator on the
                // previous line (`foo &&\nbar`). Do not reindent parenthesized groups
                // after `?? (` / `&& (` where the operator stays on the opener line.
                if(
                    operatorToken
                    &&
                    !tokenStartsLine(operatorToken, sourceCode)
                    &&
                    expression.right.loc.start.line > operatorToken.loc.start.line
                ) reportTokenAlign(sourceCode.getFirstToken(expression.right), alignColumn, sourceCode, context);
            };

        visit(root);
    },

    validateMultilineNullishAlign = (node, sourceCode, context) => {
        const root = getNullishRoot(node);

        if(root.loc.start.line === root.loc.end.line)
            return;

        const
            alignColumn = getOperatorAlignColumn(root, sourceCode),
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
                    operatorToken
                    &&
                    !tokenStartsLine(operatorToken, sourceCode)
                    &&
                    expression.right.loc.start.line > operatorToken.loc.start.line
                ) reportTokenAlign(sourceCode.getFirstToken(expression.right), alignColumn, sourceCode, context);
            };

        visit(root);
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
            // Relative/local modules normally prefer `{ name }` over default imports,
            // but JSON modules only expose a default export.
            useBracedSingleBinding = getModuleGroup(modulePath) !== 1
                && !String(modulePath).endsWith('.json');

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
                        questionColumn = question.loc.start.column,
                        testColumn = root.test.loc.start.column;
                    let current = root;

                    while(current.alternate?.type === 'ConditionalExpression'){
                        const
                            colon = getTernaryColonToken(current, sourceCode),
                            inner = current.alternate,
                            innerQuestion = getTernaryQuestionToken(inner, sourceCode),
                            trailingColonArm = colon.loc.start.line === getTernaryQuestionToken(current, sourceCode)?.loc.start.line
                                && innerQuestion.loc.start.line !== colon.loc.start.line;

                        if(trailingColonArm){
                            if(inner.test.loc.start.column !== testColumn)
                                context.report({
                                    node: inner.test,
                                    messageId: 'patternQuestionAlign',
                                    data: { column: testColumn }
                                });
                        }
                        else {
                            const middleColonColumn = inner.test.loc.start.column - 2;

                            if(colon.loc.start.column !== middleColonColumn)
                                context.report({
                                    node: colon,
                                    messageId: 'patternColonAlign',
                                    data: { column: middleColonColumn }
                                });
                        }

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
                            ) context.report({
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

    hasLogicalConditionList = node => {
        if(!node)
            return false;

        if(node.type === 'LogicalExpression' && isLogicalOperator(node.operator))
            return true;

        if(node.type === 'UnaryExpression')
            return hasLogicalConditionList(node.argument);

        if(node.type === 'ParenthesizedExpression')
            return hasLogicalConditionList(node.expression);

        if(
            node.type === 'TSAsExpression'
            ||
            node.type === 'TSSatisfiesExpression'
            ||
            node.type === 'TSNonNullExpression'
            ||
            node.type === 'TSTypeAssertion'
            ||
            node.type === 'ChainExpression'
        ) return hasLogicalConditionList(node.expression ?? node.argument);

        return false;
    },

    getControlTestParens = (node, sourceCode) => {
        const keywordToken = sourceCode.getFirstToken(node);

        if(!keywordToken)
            return null;

        // `do ... while(` — the test parens follow `while`, not `do`.
        const openParen = node.type === 'DoWhileStatement'
            ? sourceCode.getTokenBefore(node.test, { filter: token => token.value === '(' })
            : sourceCode.getTokenAfter(keywordToken, { filter: token => token.value === '(' });

        if(!openParen)
            return null;

        const closeParen = sourceCode.getTokenAfter(node.test, { filter: token => token.value === ')' });

        if(!closeParen)
            return null;

        return { openParen, closeParen };
    },

    getParenthesizedExpressionParens = (node, sourceCode) => {
        // typescript-eslint omits ParenthesizedExpression nodes; detect via tokens.
        const
            openParen = sourceCode.getTokenBefore(node),
            closeParen = sourceCode.getTokenAfter(node);

        if(!openParen || openParen.value !== '(' || !closeParen || closeParen.value !== ')')
            return null;

        return { openParen, closeParen, expression: node };
    },

    // True when this node's wrapping `(` / `)` are call/new argument parens
    // (`Boolean(...)`, `describe.skipIf(...)`, `new Foo(...)`), not grouping or `if`/`while`.
    isCallOrNewArgumentParens = (node, sourceCode) => {
        const parens = getParenthesizedExpressionParens(node, sourceCode);

        if(!parens)
            return false;

        let current = node;

        while(current.parent){
            const parent = current.parent;

            if(
                (
                    parent.type === 'CallExpression'
                    ||
                    parent.type === 'NewExpression'
                    ||
                    parent.type === 'OptionalCallExpression'
                )
                &&
                parent.arguments?.includes(current)
            ){
                const afterCallee = sourceCode.getTokenAfter(parent.callee, {
                    filter: token => token.value === '('
                });

                return afterCallee?.range[0] === parens.openParen.range[0];
            }

            if(
                parent.type === 'LogicalExpression'
                ||
                parent.type === 'BinaryExpression'
                ||
                parent.type === 'ConditionalExpression'
                ||
                parent.type === 'UnaryExpression'
                ||
                parent.type === 'AssignmentExpression'
                ||
                parent.type === 'VariableDeclarator'
                ||
                parent.type === 'ReturnStatement'
                ||
                parent.type === 'Property'
                ||
                parent.type === 'ArrayExpression'
                ||
                parent.type === 'ArrowFunctionExpression'
            ) return false;

            if(
                parent.type === 'TSAsExpression'
                ||
                parent.type === 'TSSatisfiesExpression'
                ||
                parent.type === 'TSNonNullExpression'
                ||
                parent.type === 'TSTypeAssertion'
                ||
                parent.type === 'ChainExpression'
                ||
                parent.type === 'AwaitExpression'
                ||
                parent.type === 'ParenthesizedExpression'
            ){
                current = parent;
                continue;
            }

            break;
        }

        return false;
    },

    getConditionInnerIndent = (openParen, sourceCode) => {
        const
            openLine = sourceCode.lines[openParen.loc.start.line - 1] ?? '',
            openIndent = openLine.match(/^\s*/)?.[0] ?? '';

        return `${openIndent}    `;
    },

    formatLogicalConditionList = (expression, indent, sourceCode) => {
        const formatChild = child => {
            const nestedParens = getParenthesizedExpressionParens(child, sourceCode);

            if(nestedParens){
                const innerIndent = `${indent}    `;

                return `(\n${innerIndent}${formatLogicalConditionList(child, innerIndent, sourceCode)}\n${indent})`;
            }

            return formatLogicalConditionList(child, indent, sourceCode);
        };

        if(expression.type === 'LogicalExpression' && isLogicalOperator(expression.operator))
            return `${formatChild(expression.left)}\n${indent}${expression.operator}\n${indent}${formatChild(expression.right)}`;

        if(expression.type === 'UnaryExpression' && expression.prefix){
            const argument = expression.argument.type === 'LogicalExpression'
                || getParenthesizedExpressionParens(expression.argument, sourceCode)
                ? formatChild(expression.argument)
                : sourceCode.getText(expression.argument);

            return `${expression.operator}${argument}`;
        }

        return sourceCode.getText(expression);
    },

    validateConditionParenLayout = ({
        openParen,
        closeParen,
        expression,
        sourceCode,
        context,
        body = null,
        requireAlways = false
    }) => {
        if(!hasLogicalConditionList(expression))
            return;

        const
            isMultiline = openParen.loc.end.line < expression.loc.start.line
                || expression.loc.end.line < closeParen.loc.start.line
                || expression.loc.start.line !== expression.loc.end.line;

        if(!requireAlways && !isMultiline)
            return;

        const
            indent = getConditionInnerIndent(openParen, sourceCode),
            closeIndent = indent.endsWith('    ') ? indent.slice(0, -4) : indent,
            openNeedsNewline = openParen.loc.end.line >= expression.loc.start.line,
            closeNeedsNewline = expression.loc.end.line >= closeParen.loc.start.line,
            needsOperatorLines = (() => {
                let needed = false;

                const visit = node => {
                    if(node.type === 'LogicalExpression' && isLogicalOperator(node.operator)){
                        visit(node.left);
                        visit(node.right);

                        const operatorToken = sourceCode.getTokenBefore(node.right, {
                            filter: token => token.value === node.operator
                        });

                        if(
                            !operatorToken
                            ||
                            !isOperatorAloneOnLine(operatorToken, sourceCode)
                            ||
                            operatorToken.loc.start.line <= node.left.loc.end.line
                            ||
                            operatorToken.loc.end.line >= node.right.loc.start.line
                        ) needed = true;

                        return;
                    }

                    if(node.type === 'ParenthesizedExpression')
                        visit(node.expression);
                    else if(node.type === 'UnaryExpression')
                        visit(node.argument);
                };

                visit(expression);
                return needed;
            })(),
            bodyNeedsSameLine = Boolean(
                body
                &&
                body.type !== 'BlockStatement'
                &&
                closeParen.loc.start.line !== body.loc.start.line
            );

        if(!openNeedsNewline && !closeNeedsNewline && !needsOperatorLines && !bodyNeedsSameLine)
            return;

        let messageId = 'rewriteCondition';

        if(openNeedsNewline)
            messageId = 'openParenNewline';
        else if(closeNeedsNewline)
            messageId = 'closeParenNewline';
        else if(needsOperatorLines)
            messageId = 'operatorLine';
        else if(bodyNeedsSameLine)
            messageId = 'bodySameLine';

        context.report({
            node: expression,
            messageId,
            fix: fixer => {
                const
                    formatted = formatLogicalConditionList(expression, indent, sourceCode),
                    parens = `(\n${indent}${formatted}\n${closeIndent})`;

                if(body && body.type !== 'BlockStatement'){
                    const bodyText = sourceCode.getText(body).replace(/^\s+/, '');

                    return fixer.replaceTextRange(
                        [openParen.range[0], body.range[1]],
                        `${parens} ${bodyText}`
                    );
                }

                return fixer.replaceTextRange(
                    [openParen.range[0], closeParen.range[1]],
                    parens
                );
            }
        });
    },

    isOperatorAloneOnLine = (operatorToken, sourceCode) => {
        const line = sourceCode.lines[operatorToken.loc.start.line - 1] ?? '';

        return line.trim() === operatorToken.value;
    },

    longIfLinebreak = {
        meta: {
            type: 'layout',
            docs: {
                description: 'Require parenthesized condition lists to use newlines around parentheses and logical operators, with a brace-less body on the same line as `)`.'
            },
            fixable: 'code',
            schema: [],
            messages: {
                operatorLine: 'Put each `&&` / `||` on its own line between conditions inside parentheses.',
                openParenNewline: 'Put a newline after `(` before the first condition.',
                closeParenNewline: 'Put a newline after the last condition before `)`.',
                bodySameLine: 'Put the single brace-less statement on the same line as the closing `)`.',
                rewriteCondition: 'Rewrite this parenthesized condition list with newlines around parentheses and operators.'
            }
        },
        create: context => {
            const sourceCode = context.sourceCode;

            return {
                IfStatement: node => {
                    const parens = getControlTestParens(node, sourceCode);

                    if(!parens)
                        return;

                    validateConditionParenLayout({
                        openParen: parens.openParen,
                        closeParen: parens.closeParen,
                        expression: node.test,
                        body: node.consequent,
                        sourceCode,
                        context
                    });
                },

                WhileStatement: node => {
                    const parens = getControlTestParens(node, sourceCode);

                    if(!parens)
                        return;

                    validateConditionParenLayout({
                        openParen: parens.openParen,
                        closeParen: parens.closeParen,
                        expression: node.test,
                        body: node.body,
                        sourceCode,
                        context
                    });
                },

                DoWhileStatement: node => {
                    const parens = getControlTestParens(node, sourceCode);

                    if(!parens)
                        return;

                    validateConditionParenLayout({
                        openParen: parens.openParen,
                        closeParen: parens.closeParen,
                        expression: node.test,
                        sourceCode,
                        context
                    });
                },

                ParenthesizedExpression: node => {
                    // Kept for parsers that emit this node; typescript-eslint usually does not.
                    if(!hasLogicalConditionList(node.expression))
                        return;

                    if(
                        node.parent?.type === 'IfStatement'
                        ||
                        node.parent?.type === 'WhileStatement'
                        ||
                        node.parent?.type === 'DoWhileStatement'
                        ||
                        node.parent?.type === 'ForStatement'
                    ) return;

                    if(
                        node.parent?.type === 'CallExpression'
                        ||
                        node.parent?.type === 'NewExpression'
                        ||
                        node.parent?.type === 'OptionalCallExpression'
                    ) return;

                    const
                        openParen = sourceCode.getFirstToken(node),
                        closeParen = sourceCode.getLastToken(node);

                    if(!openParen || !closeParen)
                        return;

                    validateConditionParenLayout({
                        openParen,
                        closeParen,
                        expression: node.expression,
                        sourceCode,
                        context,
                        requireAlways: true
                    });
                },

                LogicalExpression: node => {
                    // Only the root of a && / || chain.
                    if(node.parent?.type === 'LogicalExpression')
                        return;

                    if(!isLogicalOperator(node.operator))
                        return;

                    // Control-structure tests use If/While/DoWhile visitors.
                    if(isInControlStructureTest(node))
                        return;

                    const parens = getParenthesizedExpressionParens(node, sourceCode);

                    if(!parens)
                        return;

                    // Ignore `Boolean(...)`, `expect(...)`, `describe.skipIf(...)`, etc.
                    if(isCallOrNewArgumentParens(node, sourceCode))
                        return;

                    validateConditionParenLayout({
                        openParen: parens.openParen,
                        closeParen: parens.closeParen,
                        expression: node,
                        sourceCode,
                        context,
                        requireAlways: true
                    });
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
