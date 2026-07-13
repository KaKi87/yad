import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';

import localRules from './eslint-rules.js';

const
    plugins = {
        '@typescript-eslint': tseslint,
        '@stylistic': stylistic,
        local: localRules,
        'prefer-arrow-functions': preferArrowFunctions,
        'simple-import-sort': simpleImportSort,
        unicorn
    },

    rules = {
        'arrow-body-style': [
            'error',
            'as-needed',
            { requireReturnForObjectLiteral: false }
        ],
        'array-bracket-spacing': ['error', 'never'],
        'arrow-parens': ['error', 'as-needed'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', { before: false, after: true }],
        'computed-property-spacing': ['error', 'never'],
        curly: ['error', 'multi'],
        'eol-last': ['error', 'always'],
        'func-call-spacing': ['error', 'never'],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
                ignoredNodes: [
                    'ConditionalExpression'
                ]
            }
        ],
        'key-spacing': ['error', { beforeColon: false, afterColon: true }],
        'keyword-spacing': [
            'error',
            {
                before: true,
                after: true,
                overrides: {
                    if: { after: false },
                    for: { after: false },
                    while: { after: false },
                    switch: { after: false },
                    catch: { after: false }
                }
            }
        ],
        'linebreak-style': ['error', 'unix'],
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
        'no-trailing-spaces': ['error', { skipBlankLines: false }],
        'local/no-multi-spaces': ['error', { ignoreEOLComments: false }],
        'no-unused-vars': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ClassDeclaration',
                message: 'Classes are forbidden by project style.'
            },
            {
                selector: 'ClassExpression',
                message: 'Classes are forbidden by project style.'
            }
        ],
        'object-curly-newline': [
            'error',
            {
                ImportDeclaration: { multiline: true, minProperties: 2, consistent: true },
                ExportDeclaration: { multiline: true, minProperties: 2, consistent: true },
                ObjectExpression: { multiline: true, consistent: true },
                ObjectPattern: { multiline: true, consistent: true }
            }
        ],
        'object-curly-spacing': ['error', 'always'],
        'object-shorthand': ['error', 'always'],
        'one-var': [
            'error',
            {
                const: 'consecutive',
                let: 'consecutive',
                var: 'consecutive'
            }
        ],
        'operator-linebreak': [
            'error',
            'before',
            {
                overrides: {
                    '?': 'ignore',
                    ':': 'ignore'
                }
            }
        ],
        'multiline-ternary': 'off',
        'prefer-template': 'error',
        'quote-props': ['error', 'as-needed'],
        quotes: [
            'error',
            'single',
            {
                avoidEscape: true,
                allowTemplateLiterals: true
            }
        ],
        semi: ['error', 'always'],
        'semi-spacing': ['error', { before: false, after: true }],
        'space-before-blocks': [
            'error',
            {
                functions: 'always',
                keywords: 'never',
                classes: 'never'
            }
        ],
        'space-before-function-paren': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'space-unary-ops': ['error', { words: true, nonwords: false }],

        '@stylistic/template-tag-spacing': ['error', 'always'],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ],
        'prefer-arrow-functions/prefer-arrow-functions': [
            'error',
            {
                allowedNames: [],
                allowNamedFunctions: false,
                allowObjectProperties: false,
                classPropertiesAllowed: false,
                disallowPrototype: false,
                returnStyle: 'unchanged',
                singleReturnOnly: false
            }
        ],
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    ['^bun(?::|$)', '^node:', '^@std/'],
                    ['^@?\\w'],
                    ['^\\.\\.(?:/|$)'],
                    ['^\\./']
                ]
            }
        ],
        'unicorn/switch-case-braces': ['error', 'always'],

        'local/concise-arrow-body': 'error',
        'local/export-top-and-kind-order': 'error',
        'local/merge-consecutive-export-const': 'error',
        'local/newline-after-var-kind': 'error',
        'local/space-before-else-catch-do-braces': 'error',
        'local/ternary-linebreak': 'error'
    };

export default [
    {
        files: [
            '**/*.ts'
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json'
            }
        },
        plugins,
        rules
    },
    {
        files: [
            '**/*.js'
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        plugins,
        rules: {
            ...rules,
            'local/export-top-and-kind-order': 'off'
        }
    }
];
