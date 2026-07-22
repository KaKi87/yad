/**
 * AUTO-GENERATED from data/yad.1 — do not edit.
 * Regenerate with: bun run generate
 */

import type { GeneratedCommonOptions, GeneratedModeOptions, DialogMode } from './options.ts';

export type ArgBuilderHelpers = {
    pushFlag: (args: string[], flag: string, value?: boolean) => void;
    pushValue: (args: string[], flag: string, value: string | number | undefined) => void;
    pushOptional: (args: string[], flag: string, value: string | number | boolean | undefined) => void;
};

export const pushGeneratedCommonArgs = (
    args: string[],
    options: GeneratedCommonOptions,
    { pushFlag, pushValue, pushOptional }: ArgBuilderHelpers
): void => {
    pushFlag(args, '--add-preview', options.addPreview);
    pushFlag(args, '--always-print-result', options.alwaysPrintResult);
    pushValue(args, '--bool-fmt', options.boolFmt);
    pushValue(args, '--borders', options.borders);
    pushValue(args, '--buttons-layout', options.buttonsLayout);
    pushFlag(args, '--center', options.center);
    pushFlag(args, '--close-on-unfocus', options.closeOnUnfocus);
    pushValue(args, '--css', options.css);
    pushFlag(args, '--enable-spell', options.enableSpell);
    pushFlag(args, '--escape-ok', options.escapeOk);
    pushOptional(args, '--expander', options.expander);
    pushValue(args, '--f1-action', options.f1Action);
    pushFlag(args, '--fixed', options.fixed);
    pushFlag(args, '--fullscreen', options.fullscreen);
    pushValue(args, '--geometry', options.geometry);
    pushValue(args, '--gtkrc', options.gtkrc);
    pushValue(args, '--height', options.height);
    pushValue(args, '--hscroll-policy', options.hscrollPolicy);
    pushValue(args, '--icon-theme', options.iconTheme);
    pushValue(args, '--image', options.image);
    if(options.imagePaths)
        for(const value of options.imagePaths)
            pushValue(args, '--image-path', value);
    pushFlag(args, '--keep-icon-size', options.keepIconSize);
    pushOptional(args, '--kill-parent', options.killParent);
    pushFlag(args, '--large-preview', options.largePreview);
    pushFlag(args, '--maximized', options.maximized);
    pushFlag(args, '--mouse', options.mouse);
    pushFlag(args, '--no-buttons', options.noButtons);
    pushFlag(args, '--no-escape', options.noEscape);
    pushFlag(args, '--no-focus', options.noFocus);
    pushFlag(args, '--no-markup', options.noMarkup);
    pushFlag(args, '--on-top', options.onTop);
    pushValue(args, '--plug', options.plug);
    pushValue(args, '--posx', options.posX);
    pushValue(args, '--posy', options.posY);
    pushOptional(args, '--print-xid', options.printXid);
    pushValue(args, '--response', options.response);
    pushValue(args, '--rest', options.rest);
    pushFlag(args, '--selectable-labels', options.selectableLabels);
    pushFlag(args, '--skip-taskbar', options.skipTaskbar);
    pushValue(args, '--spell-lang', options.spellLang);
    pushFlag(args, '--sticky', options.sticky);
    pushValue(args, '--tabnum', options.tabNum);
    pushValue(args, '--text', options.text);
    pushValue(args, '--text-align', options.textAlign);
    pushValue(args, '--text-width', options.textWidth);
    pushValue(args, '--timeout', options.timeout);
    pushValue(args, '--timeout-indicator', options.timeoutIndicator);
    pushValue(args, '--title', options.title);
    pushFlag(args, '--undecorated', options.undecorated);
    pushValue(args, '--uri-handler', options.uriHandler);
    pushOptional(args, '--use-interp', options.useInterp);
    pushValue(args, '--vscroll-policy', options.vscrollPolicy);
    pushValue(args, '--width', options.width);
    pushValue(args, '--window-icon', options.windowIcon);
    pushValue(args, '--window-type', options.windowType);
    pushValue(args, '--workdir', options.workdir);
    pushFlag(args, '--write-settings', options.writeSettings);
};

export const pushGeneratedModeArgs = <M extends DialogMode>(
    args: string[],
    mode: M,
    options: GeneratedModeOptions[M],
    helpers: ArgBuilderHelpers
): void => {
    const { pushFlag, pushValue, pushOptional } = helpers;
    switch(mode){
        case 'message': {
            break;
        }
        case 'about': {
            const modeOptions = options as GeneratedModeOptions['about'];
            pushValue(args, '--authors', modeOptions.authors);
            pushValue(args, '--comments', modeOptions.comments);
            pushValue(args, '--copyright', modeOptions.copyright);
            pushValue(args, '--image', modeOptions.image);
            pushValue(args, '--license', modeOptions.license);
            pushValue(args, '--pname', modeOptions.programName);
            pushValue(args, '--pversion', modeOptions.programVersion);
            pushValue(args, '--website', modeOptions.website);
            pushValue(args, '--website-label', modeOptions.websiteLabel);
            break;
        }
        case 'app': {
            const modeOptions = options as GeneratedModeOptions['app'];
            pushFlag(args, '--enable-all', modeOptions.enableAll);
            pushFlag(args, '--enable-fallback', modeOptions.enableFallback);
            pushFlag(args, '--enable-other', modeOptions.enableOther);
            pushFlag(args, '--extened', modeOptions.extended);
            break;
        }
        case 'appindicator': {
            const modeOptions = options as GeneratedModeOptions['appindicator'];
            pushFlag(args, '--hidden', modeOptions.hidden);
            pushValue(args, '--item-separator', modeOptions.itemSeparator);
            pushFlag(args, '--listen', modeOptions.listen);
            pushValue(args, '--menu', modeOptions.menu);
            pushValue(args, '--separator', modeOptions.separator);
            break;
        }
        case 'calendar': {
            const modeOptions = options as GeneratedModeOptions['calendar'];
            pushValue(args, '--date-format', modeOptions.dateFormat);
            pushValue(args, '--day', modeOptions.day);
            pushValue(args, '--details', modeOptions.details);
            pushValue(args, '--month', modeOptions.month);
            pushValue(args, '--select-action', modeOptions.selectAction);
            pushFlag(args, '--show-weeks', modeOptions.showWeeks);
            pushValue(args, '--year', modeOptions.year);
            break;
        }
        case 'color': {
            const modeOptions = options as GeneratedModeOptions['color'];
            pushFlag(args, '--alpha', modeOptions.alpha);
            pushFlag(args, '--expand-palette', modeOptions.expandPalette);
            pushFlag(args, '--gtk-palette', modeOptions.gtkPalette);
            pushValue(args, '--init-color', modeOptions.initColor);
            pushValue(args, '--mode', modeOptions.mode);
            pushOptional(args, '--palette', modeOptions.palette);
            pushFlag(args, '--picker', modeOptions.picker);
            break;
        }
        case 'dnd': {
            const modeOptions = options as GeneratedModeOptions['dnd'];
            pushValue(args, '--command', modeOptions.command);
            pushValue(args, '--exit-on-drop', modeOptions.exitOnDrop);
            pushFlag(args, '--tooltip', modeOptions.tooltip);
            break;
        }
        case 'entry': {
            const modeOptions = options as GeneratedModeOptions['entry'];
            pushValue(args, '--complete', modeOptions.complete);
            pushFlag(args, '--completion', modeOptions.completion);
            pushFlag(args, '--editable', modeOptions.editable);
            pushValue(args, '--entry-label', modeOptions.entryLabel);
            pushValue(args, '--entry-text', modeOptions.entryText);
            pushValue(args, '--float-precision', modeOptions.floatPrecision);
            pushFlag(args, '--hide-text', modeOptions.hideText);
            pushValue(args, '--licon', modeOptions.licon);
            pushValue(args, '--licon-action', modeOptions.liconAction);
            pushFlag(args, '--num-output', modeOptions.numOutput);
            pushFlag(args, '--numeric', modeOptions.numeric);
            pushValue(args, '--ricon', modeOptions.ricon);
            pushValue(args, '--ricon-action', modeOptions.riconAction);
            break;
        }
        case 'file': {
            const modeOptions = options as GeneratedModeOptions['file'];
            pushOptional(args, '--confirm-overwrite', modeOptions.confirmOverwrite);
            pushFlag(args, '--directory', modeOptions.directory);
            pushValue(args, '--filename', modeOptions.filename);
            pushFlag(args, '--multiple', modeOptions.multiple);
            pushFlag(args, '--quoted-output', modeOptions.quotedOutput);
            pushFlag(args, '--save', modeOptions.save);
            pushValue(args, '--separator', modeOptions.separator);
            break;
        }
        case 'font': {
            const modeOptions = options as GeneratedModeOptions['font'];
            pushValue(args, '--fontname', modeOptions.fontname);
            pushFlag(args, '--preview', modeOptions.preview);
            pushFlag(args, '--quoted-output', modeOptions.quotedOutput);
            pushFlag(args, '--separate-output', modeOptions.separateOutput);
            pushValue(args, '--separator', modeOptions.separator);
            break;
        }
        case 'form': {
            const modeOptions = options as GeneratedModeOptions['form'];
            pushValue(args, '--align', modeOptions.align);
            pushFlag(args, '--align-buttons', modeOptions.alignButtons);
            pushValue(args, '--changed-action', modeOptions.changedAction);
            pushValue(args, '--columns', modeOptions.columns);
            pushValue(args, '--complete', modeOptions.complete);
            pushFlag(args, '--cycle-read', modeOptions.cycleRead);
            pushValue(args, '--date-format', modeOptions.dateFormat);
            pushValue(args, '--float-precision', modeOptions.floatPrecision);
            pushValue(args, '--focus-field', modeOptions.focusField);
            pushFlag(args, '--homogeneous', modeOptions.homogeneous);
            pushValue(args, '--item-separator', modeOptions.itemSeparator);
            pushFlag(args, '--num-output', modeOptions.numOutput);
            pushFlag(args, '--output-by-row', modeOptions.outputByRow);
            pushFlag(args, '--quoted-output', modeOptions.quotedOutput);
            pushFlag(args, '--scroll', modeOptions.scroll);
            pushValue(args, '--separator', modeOptions.separator);
            break;
        }
        case 'html': {
            const modeOptions = options as GeneratedModeOptions['html'];
            pushFlag(args, '--browser', modeOptions.browser);
            pushFlag(args, '--disable-search', modeOptions.disableSearch);
            pushValue(args, '--encoding', modeOptions.encoding);
            pushFlag(args, '--file-op', modeOptions.fileOp);
            pushValue(args, '--mime', modeOptions.mime);
            pushFlag(args, '--print-uri', modeOptions.printUri);
            pushValue(args, '--uri', modeOptions.uri);
            pushValue(args, '--uri-handler', modeOptions.uriHandler);
            pushValue(args, '--user-agent', modeOptions.userAgent);
            pushValue(args, '--user-style', modeOptions.userStyle);
            break;
        }
        case 'icons': {
            const modeOptions = options as GeneratedModeOptions['icons'];
            pushFlag(args, '--compact', modeOptions.compact);
            pushFlag(args, '--descend', modeOptions.descend);
            pushFlag(args, '--generic', modeOptions.generic);
            pushFlag(args, '--icon-size', modeOptions.iconSize);
            pushFlag(args, '--item-width', modeOptions.itemWidth);
            pushFlag(args, '--listen', modeOptions.listen);
            pushFlag(args, '--monitor', modeOptions.monitor);
            pushValue(args, '--read-dir', modeOptions.readDir);
            pushFlag(args, '--single-click', modeOptions.singleClick);
            pushFlag(args, '--sort-by-name', modeOptions.sortByName);
            pushFlag(args, '--term', modeOptions.term);
            break;
        }
        case 'list': {
            const modeOptions = options as GeneratedModeOptions['list'];
            pushFlag(args, '--add-on-top', modeOptions.addOnTop);
            pushFlag(args, '--checklist', modeOptions.checklist);
            pushValue(args, '--column-align', modeOptions.columnAlign);
            pushValue(args, '--dclick-action', modeOptions.dclickAction);
            pushFlag(args, '--editable', modeOptions.editable);
            pushValue(args, '--editable-cols', modeOptions.editableCols);
            pushValue(args, '--ellipsize', modeOptions.ellipsize);
            pushValue(args, '--ellipsize-cols', modeOptions.ellipsizeCols);
            pushValue(args, '--expand-column', modeOptions.expandColumn);
            pushValue(args, '--float-precision', modeOptions.floatPrecision);
            pushValue(args, '--grid-lines', modeOptions.gridLines);
            pushValue(args, '--header-align', modeOptions.headerAlign);
            pushFlag(args, '--header-tips', modeOptions.headerTips);
            pushValue(args, '--hide-column', modeOptions.hideColumn);
            pushFlag(args, '--iec-format', modeOptions.iecFormat);
            pushValue(args, '--limit', modeOptions.limit);
            pushFlag(args, '--listen', modeOptions.listen);
            pushFlag(args, '--multiple', modeOptions.multiple);
            pushFlag(args, '--no-click', modeOptions.noClick);
            pushFlag(args, '--no-headers', modeOptions.noHeaders);
            pushFlag(args, '--no-rules-hint', modeOptions.noRulesHint);
            pushFlag(args, '--no-selection', modeOptions.noSelection);
            pushFlag(args, '--print-all', modeOptions.printAll);
            pushValue(args, '--print-column', modeOptions.printColumn);
            pushFlag(args, '--quoted-output', modeOptions.quotedOutput);
            pushFlag(args, '--radiolist', modeOptions.radiolist);
            pushFlag(args, '--regex-search', modeOptions.regexSearch);
            pushValue(args, '--row-action', modeOptions.rowAction);
            pushValue(args, '--search-column', modeOptions.searchColumn);
            pushValue(args, '--select-action', modeOptions.selectAction);
            pushValue(args, '--sep-column', modeOptions.sepColumn);
            pushValue(args, '--sep-value', modeOptions.sepValue);
            pushValue(args, '--separator', modeOptions.separator);
            pushFlag(args, '--simple-tips', modeOptions.simpleTips);
            pushFlag(args, '--tail', modeOptions.tail);
            pushValue(args, '--tooltip-column', modeOptions.tooltipColumn);
            pushFlag(args, '--tree', modeOptions.tree);
            pushFlag(args, '--tree-expanded', modeOptions.treeExpanded);
            pushValue(args, '--wrap-cols', modeOptions.wrapCols);
            pushValue(args, '--wrap-width', modeOptions.wrapWidth);
            break;
        }
        case 'notebook': {
            const modeOptions = options as GeneratedModeOptions['notebook'];
            pushValue(args, '--active-tab', modeOptions.activeTab);
            pushFlag(args, '--expand', modeOptions.expand);
            pushValue(args, '--key', modeOptions.key);
            pushFlag(args, '--stack', modeOptions.stack);
            pushValue(args, '--tab-borders', modeOptions.tabBorders);
            pushValue(args, '--tab-pos', modeOptions.tabPos);
            break;
        }
        case 'notification': {
            const modeOptions = options as GeneratedModeOptions['notification'];
            pushValue(args, '--command', modeOptions.command);
            pushFlag(args, '--hidden', modeOptions.hidden);
            pushValue(args, '--icon-size', modeOptions.iconSize);
            pushValue(args, '--item-separator', modeOptions.itemSeparator);
            pushFlag(args, '--listen', modeOptions.listen);
            pushValue(args, '--menu', modeOptions.menu);
            pushFlag(args, '--no-middle', modeOptions.noMiddle);
            pushValue(args, '--separator', modeOptions.separator);
            break;
        }
        case 'paned': {
            const modeOptions = options as GeneratedModeOptions['paned'];
            pushValue(args, '--focused', modeOptions.focused);
            pushValue(args, '--key', modeOptions.key);
            pushValue(args, '--orient', modeOptions.orient);
            pushValue(args, '--splitter', modeOptions.splitter);
            break;
        }
        case 'picture': {
            const modeOptions = options as GeneratedModeOptions['picture'];
            pushFlag(args, '--file-op', modeOptions.fileOp);
            pushValue(args, '--filename', modeOptions.filename);
            pushValue(args, '--image-changed', modeOptions.imageChanged);
            pushValue(args, '--inc', modeOptions.inc);
            pushValue(args, '--size', modeOptions.size);
            break;
        }
        case 'popup': {
            const modeOptions = options as GeneratedModeOptions['popup'];
            pushValue(args, '--align', modeOptions.align);
            pushFlag(args, '--keep', modeOptions.keep);
            pushValue(args, '--timeout', modeOptions.timeout);
            pushValue(args, '--transparent', modeOptions.transparent);
            break;
        }
        case 'print': {
            const modeOptions = options as GeneratedModeOptions['print'];
            pushFlag(args, '--add-preview', modeOptions.addPreview);
            pushValue(args, '--filename', modeOptions.filename);
            pushValue(args, '--fontname', modeOptions.fontname);
            pushFlag(args, '--headers', modeOptions.headers);
            pushValue(args, '--type', modeOptions.type);
            break;
        }
        case 'progress': {
            const modeOptions = options as GeneratedModeOptions['progress'];
            pushValue(args, '--align', modeOptions.align);
            pushFlag(args, '--auto-close', modeOptions.autoClose);
            pushFlag(args, '--auto-kill', modeOptions.autoKill);
            pushFlag(args, '--continuous', modeOptions.continuous);
            pushOptional(args, '--enable-log', modeOptions.enableLog);
            pushFlag(args, '--hide-text', modeOptions.hideText);
            pushFlag(args, '--log-expanded', modeOptions.logExpanded);
            pushFlag(args, '--log-height', modeOptions.logHeight);
            pushFlag(args, '--log-on-top', modeOptions.logOnTop);
            pushValue(args, '--progress-text', modeOptions.progressText);
            pushFlag(args, '--pulsate', modeOptions.pulsate);
            pushFlag(args, '--rtl', modeOptions.rtl);
            pushFlag(args, '--scroll', modeOptions.scroll);
            pushFlag(args, '--vertical', modeOptions.vertical);
            break;
        }
        case 'scale': {
            const modeOptions = options as GeneratedModeOptions['scale'];
            pushFlag(args, '--enforce-step', modeOptions.enforceStep);
            pushFlag(args, '--hide-value', modeOptions.hideValue);
            pushFlag(args, '--inc-buttons', modeOptions.incButtons);
            pushFlag(args, '--invert', modeOptions.invert);
            pushValue(args, '--max-value', modeOptions.maxValue);
            pushValue(args, '--min-value', modeOptions.minValue);
            pushValue(args, '--page', modeOptions.page);
            pushFlag(args, '--print-partial', modeOptions.printPartial);
            pushValue(args, '--step', modeOptions.step);
            pushValue(args, '--value', modeOptions.value);
            pushFlag(args, '--vertical', modeOptions.vertical);
            break;
        }
        case 'text-info': {
            const modeOptions = options as GeneratedModeOptions['text-info'];
            pushValue(args, '--back', modeOptions.back);
            pushFlag(args, '--brackets', modeOptions.brackets);
            pushOptional(args, '--confirm-save', modeOptions.confirmSave);
            pushFlag(args, '--disable-search', modeOptions.disableSearch);
            pushFlag(args, '--editable', modeOptions.editable);
            pushFlag(args, '--file-op', modeOptions.fileOp);
            pushValue(args, '--filename', modeOptions.filename);
            pushValue(args, '--fore', modeOptions.fore);
            pushFlag(args, '--formatted', modeOptions.formatted);
            pushFlag(args, '--in-place', modeOptions.inPlace);
            pushFlag(args, '--indent', modeOptions.indent);
            pushFlag(args, '--indent-width', modeOptions.indentWidth);
            pushValue(args, '--justify', modeOptions.justify);
            pushValue(args, '--lang', modeOptions.lang);
            pushValue(args, '--line', modeOptions.line);
            pushFlag(args, '--line-hl', modeOptions.lineHl);
            pushFlag(args, '--line-marks', modeOptions.lineMarks);
            pushFlag(args, '--line-num', modeOptions.lineNum);
            pushFlag(args, '--listen', modeOptions.listen);
            pushValue(args, '--margins', modeOptions.margins);
            pushValue(args, '--mark1-color', modeOptions.mark1Color);
            pushValue(args, '--mark2-color', modeOptions.mark2Color);
            pushValue(args, '--mime', modeOptions.mime);
            pushOptional(args, '--right-margin', modeOptions.rightMargin);
            pushFlag(args, '--show-cursor', modeOptions.showCursor);
            pushFlag(args, '--show-uri', modeOptions.showUri);
            pushFlag(args, '--smart-bs', modeOptions.smartBs);
            pushValue(args, '--smart-he', modeOptions.smartHe);
            pushFlag(args, '--spaces', modeOptions.spaces);
            pushFlag(args, '--tab-width', modeOptions.tabWidth);
            pushFlag(args, '--tail', modeOptions.tail);
            pushValue(args, '--theme', modeOptions.theme);
            pushValue(args, '--uri-color', modeOptions.uriColor);
            pushFlag(args, '--wrap', modeOptions.wrap);
            break;
        }
    }
};

