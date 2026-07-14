import type {
    FormField,
    ListColumn
} from '../types/dialogs.ts';
import type { CommonOptions } from '../types/common.ts';
import { ExitCode } from '../types/exit-codes.ts';

import type { YadAppBackend } from './yad-app.ts';

export type WizardInfoStep = {
    type: 'info' | 'warning' | 'error';
    text: string;
    title?: string;
};

export type WizardPromptStep = {
    type: 'prompt';
    label: string;
    key: string;
    default?: string;
    password?: boolean;
    numeric?: boolean;
    items?: string[];
    title?: string;
};

export type WizardFormStep = {
    type: 'form';
    title?: string;
    fields: FormField[];
    keys?: string[];
};

export type WizardConfirmStep = {
    type: 'confirm';
    text: string;
    title?: string;
};

export type WizardSelectStep = {
    type: 'select';
    title?: string;
    key: string;
    columns: ListColumn[];
    rows: string[][];
    multiple?: boolean;
    checklist?: boolean;
    radiolist?: boolean;
};

export type WizardCustomStep<T = unknown> = {
    type: 'custom';
    run: (ctx: { state: Record<string, unknown> }) => Promise<T | null>;
};

export type WizardStep =
    | WizardInfoStep
    | WizardPromptStep
    | WizardFormStep
    | WizardConfirmStep
    | WizardSelectStep
    | WizardCustomStep;

export type WizardOptions = {
    yad: YadAppBackend;
    defaults: CommonOptions;
    state: Record<string, unknown>;
    steps: WizardStep[];
    withDefaults: <T extends CommonOptions>(options: T) => T;
};

export type WizardResult = {
    completed: boolean;
    state: Record<string, unknown>;
    cancelledAt?: number;
};

export const createWizard = ({
    yad,
    defaults,
    state,
    steps,
    withDefaults
}: WizardOptions) => {
    const run = async (): Promise<WizardResult> => {
        for(let index = 0; index < steps.length; index++){
            const step = steps[index];

            if(isAlertStep(step)){
                const fn = step.type === 'warning' ? yad.warning
                         : step.type === 'error'   ? yad.error
                                                   : yad.info;
                await fn(step.text, withDefaults({ title: step.title ?? defaults.title }));
                continue;
            }

            if(step.type === 'prompt'){
                const result = await yad.entry(withDefaults({
                    title: step.title ?? defaults.title,
                    entryLabel: step.label,
                    entryText: step.default,
                    hideText: step.password,
                    numeric: step.numeric,
                    items: step.items
                }));

                if(!result.ok)
                    return { completed: false, state, cancelledAt: index };

                state[step.key] = result.value;
                continue;
            }

            if(step.type === 'form'){
                const result = await yad.form(withDefaults({
                    title: step.title ?? defaults.title,
                    fields: step.fields
                }));

                if(!result.ok || !result.value)
                    return { completed: false, state, cancelledAt: index };

                if(step.keys)
                    step.keys.forEach(key => state[key] = result.value!.byLabel[key]);

                else
                    Object.assign(state, result.value.byLabel);

                continue;
            }

            if(step.type === 'confirm'){
                const result = await yad.question(step.text, withDefaults({
                    title: step.title ?? defaults.title
                }));

                if(result.exitCode !== ExitCode.ok)
                    return { completed: false, state, cancelledAt: index };

                continue;
            }

            if(step.type === 'select'){
                const result = await yad.list(withDefaults({
                    title: step.title ?? defaults.title,
                    columns: step.columns,
                    rows: step.rows,
                    multiple: step.multiple,
                    checklist: step.checklist,
                    radiolist: step.radiolist
                }));

                if(!result.ok || !result.value)
                    return { completed: false, state, cancelledAt: index };

                const rows = (result.value as { rows: string[][] }).rows;
                state[step.key] = step.multiple || step.checklist ? rows : rows[0];
                continue;
            }

            if(step.type === 'custom'){
                const result = await step.run({ state });
                if(result === null)
                    return { completed: false, state, cancelledAt: index };
                continue;
            }
        }

        return { completed: true, state };
    };

    return { run, steps, state };
};

const isAlertStep = (step: WizardStep): step is WizardInfoStep =>
    ['info', 'warning', 'error'].includes(step.type);
