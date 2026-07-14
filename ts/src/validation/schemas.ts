import Joi from 'joi';

import type { CreateYadOptions } from '../types/common.ts';
import type {
    DialogMode,
    DialogOptionsMap
} from '../types/dialogs.ts';
import type { DownloadYadOptions } from '../types/download.ts';

export const
    validateCreateYadOptions = (options?: CreateYadOptions): CreateYadOptions => {
        const { value, error } = createYadOptionsSchema.validate(options ?? {});
        if(error)
            throw new Error(`Invalid createYad options: ${error.message}`);
        return value;
    },

    validateDownloadYadOptions = (options?: DownloadYadOptions): DownloadYadOptions => {
        const { value, error } = downloadYadOptionsSchema.validate(options ?? {});
        if(error)
            throw new Error(`Invalid download options: ${error.message}`);
        return value;
    },

    validateDialogOptions = <M extends DialogMode>(
        mode: M,
        options: DialogOptionsMap[M]
    ): DialogOptionsMap[M] => {
        const
            schema = dialogSchemas[mode],
            { value, error } = schema.validate(options);
        if(error)
            throw new Error(`Invalid ${mode} options: ${error.message}`);
        return value;
    };

const
    buttonSchema = Joi.object({
        label: Joi.string(),
        icon: Joi.string(),
        tooltip: Joi.string(),
        id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required()
    }),

    fileFilterSchema = Joi.object({
        name: Joi.string().required(),
        patterns: Joi.array().items(Joi.string()).min(1).required()
    }),

    mimeFilterSchema = Joi.object({
        name: Joi.string().required(),
        mimes: Joi.array().items(Joi.string()).min(1).required()
    }),

    commonOptionsSchema = Joi.object({
        title: Joi.string(),
        windowIcon: Joi.string(),
        width: Joi.number().integer().positive(),
        height: Joi.number().integer().positive(),
        posX: Joi.number().integer(),
        posY: Joi.number().integer(),
        geometry: Joi.string(),
        borders: Joi.number().integer().min(0),
        sticky: Joi.boolean(),
        fixed: Joi.boolean(),
        center: Joi.boolean(),
        mouse: Joi.boolean(),
        onTop: Joi.boolean(),
        undecorated: Joi.boolean(),
        skipTaskbar: Joi.boolean(),
        maximized: Joi.boolean(),
        fullscreen: Joi.boolean(),
        windowType: Joi.string().valid(
            'normal', 'dialog', 'utility', 'dock', 'desktop', 'tooltip', 'notification', 'splash'
        ),
        noFocus: Joi.boolean(),
        closeOnUnfocus: Joi.boolean(),
        text: Joi.string().allow(''),
        textWidth: Joi.number().integer().positive(),
        textAlign: Joi.string().valid('left', 'right', 'center', 'fill'),
        image: Joi.string(),
        iconTheme: Joi.string(),
        keepIconSize: Joi.boolean(),
        imagePaths: Joi.array().items(Joi.string()),
        expander: Joi.alternatives().try(Joi.boolean(), Joi.string()),
        noMarkup: Joi.boolean(),
        selectableLabels: Joi.boolean(),
        hscrollPolicy: Joi.string().valid('auto', 'always', 'never'),
        vscrollPolicy: Joi.string().valid('auto', 'always', 'never'),
        buttons: Joi.array().items(buttonSchema),
        noButtons: Joi.boolean(),
        buttonsLayout: Joi.string().valid('spread', 'edge', 'start', 'end', 'center'),
        noEscape: Joi.boolean(),
        escapeOk: Joi.boolean(),
        response: Joi.number().integer(),
        alwaysPrintResult: Joi.boolean(),
        timeout: Joi.number().integer().min(0),
        timeoutIndicator: Joi.string().valid('top', 'bottom', 'left', 'right'),
        killParent: Joi.alternatives().try(Joi.boolean(), Joi.string()),
        plug: Joi.number().integer(),
        tabNum: Joi.number().integer().min(0),
        useInterp: Joi.alternatives().try(Joi.boolean(), Joi.string()),
        uriHandler: Joi.string(),
        f1Action: Joi.string(),
        workdir: Joi.string(),
        css: Joi.string(),
        rest: Joi.string(),
        printXid: Joi.alternatives().try(Joi.boolean(), Joi.string()),
        enableSpell: Joi.boolean(),
        spellLang: Joi.string(),
        boolFmt: Joi.string().valid('T', 't', 'Y', 'y', 'O', 'o', '1'),
        fileFilters: Joi.array().items(fileFilterSchema),
        mimeFilters: Joi.array().items(mimeFilterSchema),
        imageFilters: Joi.array().items(Joi.alternatives().try(Joi.boolean(), Joi.string())),
        addPreview: Joi.boolean(),
        largePreview: Joi.boolean()
    }).unknown(false),

    createYadOptionsSchema = Joi.object({
        path: Joi.string()
    }).unknown(false),

    downloadYadOptionsSchema = Joi.object({
        path: Joi.string(),
        apiUrl: Joi.string().uri(),
        arch: Joi.string().valid('amd64', 'arm64')
    }).unknown(false),

    formFieldSchema = Joi.object({
        label: Joi.string().required(),
        tooltip: Joi.string(),
        type: Joi.string().valid(
            'H', 'RO', 'NUM', 'CHK', 'CB', 'CBE', 'CE',
            'FL', 'SFL', 'DIR', 'CDIR', 'FN', 'MFL', 'MDIR',
            'DT', 'SCL', 'SW', 'APP', 'ICON', 'CLR',
            'BTN', 'FBTN', 'LINK', 'LBL', 'TXT'
        ),
        value: Joi.string(),
        items: Joi.array().items(Joi.string()),
        disabled: Joi.boolean()
    }),

    listColumnSchema = Joi.object({
        name: Joi.string().required(),
        tooltip: Joi.string(),
        type: Joi.string().valid(
            'TEXT', 'NUM', 'SZ', 'FLT', 'CHK', 'RD', 'BAR', 'IMG', 'HD', 'TIP'
        )
    }),

    dialogSchemas: Record<DialogMode, Joi.ObjectSchema> = {
        message: commonOptionsSchema,
        about: commonOptionsSchema.keys({
            programName: Joi.string(),
            programVersion: Joi.string(),
            copyright: Joi.string(),
            comments: Joi.string(),
            license: Joi.string(),
            authors: Joi.string(),
            website: Joi.string(),
            websiteLabel: Joi.string()
        }),
        app: commonOptionsSchema.keys({
            enableFallback: Joi.boolean(),
            enableOther: Joi.boolean(),
            enableAll: Joi.boolean(),
            extended: Joi.boolean(),
            mimeType: Joi.string()
        }),
        calendar: commonOptionsSchema.keys({
            day: Joi.number().integer().min(1).max(31),
            month: Joi.number().integer().min(1).max(12),
            year: Joi.number().integer(),
            dateFormat: Joi.string(),
            showWeeks: Joi.boolean(),
            details: Joi.string(),
            selectAction: Joi.string()
        }),
        color: commonOptionsSchema.keys({
            initColor: Joi.string(),
            gtkPalette: Joi.boolean(),
            picker: Joi.boolean(),
            alpha: Joi.boolean(),
            palette: Joi.alternatives().try(Joi.boolean(), Joi.string()),
            expandPalette: Joi.boolean(),
            mode: Joi.string().valid('hex', 'rgb')
        }),
        dnd: commonOptionsSchema.keys({
            tooltip: Joi.boolean(),
            command: Joi.string(),
            exitOnDrop: Joi.number().integer().min(0)
        }),
        entry: commonOptionsSchema.keys({
            entryLabel: Joi.string(),
            entryText: Joi.string(),
            hideText: Joi.boolean(),
            completion: Joi.boolean(),
            complete: Joi.string().valid('any', 'all', 'regex'),
            editable: Joi.boolean(),
            numeric: Joi.boolean(),
            floatPrecision: Joi.number().integer().min(0),
            leftIcon: Joi.string(),
            leftIconAction: Joi.string(),
            rightIcon: Joi.string(),
            rightIconAction: Joi.string(),
            numOutput: Joi.boolean(),
            items: Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
        }),
        icons: commonOptionsSchema.keys({
            readDir: Joi.string(),
            monitor: Joi.boolean(),
            generic: Joi.boolean(),
            sortByName: Joi.boolean(),
            descend: Joi.boolean(),
            listen: Joi.boolean(),
            itemWidth: Joi.number().integer().positive(),
            iconSize: Joi.number().integer().positive(),
            compact: Joi.boolean(),
            singleClick: Joi.boolean(),
            term: Joi.string()
        }),
        file: commonOptionsSchema.keys({
            filename: Joi.string(),
            multiple: Joi.boolean(),
            directory: Joi.boolean(),
            save: Joi.boolean(),
            separator: Joi.string(),
            confirmOverwrite: Joi.alternatives().try(Joi.boolean(), Joi.string()),
            quotedOutput: Joi.boolean()
        }),
        font: commonOptionsSchema.keys({
            fontName: Joi.string(),
            preview: Joi.string(),
            separateOutput: Joi.boolean(),
            separator: Joi.string(),
            quotedOutput: Joi.boolean()
        }),
        form: commonOptionsSchema.keys({
            fields: Joi.array().items(formFieldSchema).min(1).required(),
            align: Joi.string().valid('left', 'center', 'right'),
            columns: Joi.number().integer().positive(),
            separator: Joi.string(),
            focusField: Joi.number().integer().min(1),
            cycleRead: Joi.boolean(),
            alignButtons: Joi.boolean(),
            itemSeparator: Joi.string(),
            dateFormat: Joi.string(),
            floatPrecision: Joi.number().integer().min(0),
            complete: Joi.string().valid('any', 'all', 'regex'),
            scroll: Joi.boolean(),
            homogeneous: Joi.boolean(),
            changedAction: Joi.string(),
            quotedOutput: Joi.boolean(),
            outputByRow: Joi.boolean(),
            numOutput: Joi.boolean(),
            values: Joi.array().items(Joi.string())
        }),
        html: commonOptionsSchema.keys({
            uri: Joi.string(),
            browser: Joi.boolean(),
            printUri: Joi.boolean(),
            mime: Joi.string(),
            encoding: Joi.string(),
            userAgent: Joi.string(),
            userStyle: Joi.string(),
            disableSearch: Joi.boolean(),
            fileOp: Joi.boolean(),
            webkitProps: Joi.array().items(Joi.string()),
            content: Joi.string(),
            uris: Joi.array().items(Joi.string())
        }),
        list: commonOptionsSchema.keys({
            columns: Joi.array().items(listColumnSchema).min(1).required(),
            rows: Joi.array().items(Joi.array().items(Joi.string())),
            tree: Joi.boolean(),
            checklist: Joi.boolean(),
            radiolist: Joi.boolean(),
            separator: Joi.string(),
            multiple: Joi.boolean(),
            editable: Joi.boolean(),
            editableCols: Joi.array().items(Joi.number().integer().positive()),
            noHeaders: Joi.boolean(),
            noClick: Joi.boolean(),
            noRulesHint: Joi.boolean(),
            gridLines: Joi.string().valid('horizontal', 'vertical', 'both'),
            noSelection: Joi.boolean(),
            printAll: Joi.boolean(),
            printColumn: Joi.number().integer().min(0),
            hideColumns: Joi.array().items(Joi.number().integer().positive()),
            expandColumn: Joi.number().integer().min(0),
            searchColumn: Joi.number().integer().min(0),
            tooltipColumn: Joi.number().integer().min(0),
            sepColumn: Joi.number().integer().min(0),
            sepValue: Joi.string(),
            limit: Joi.number().integer().positive(),
            wrapWidth: Joi.number().integer().positive(),
            wrapCols: Joi.array().items(Joi.number().integer().positive()),
            ellipsize: Joi.string().valid('NONE', 'START', 'MIDDLE', 'END'),
            ellipsizeCols: Joi.array().items(Joi.number().integer().positive()),
            dclickAction: Joi.string(),
            selectAction: Joi.string(),
            rowAction: Joi.string(),
            treeExpanded: Joi.boolean(),
            regexSearch: Joi.boolean(),
            listen: Joi.boolean(),
            quotedOutput: Joi.boolean(),
            floatPrecision: Joi.number().integer().min(0),
            addOnTop: Joi.boolean(),
            tail: Joi.boolean(),
            iecFormat: Joi.boolean(),
            simpleTips: Joi.boolean(),
            headerTips: Joi.boolean(),
            columnAlign: Joi.string(),
            headerAlign: Joi.string()
        }),
        notebook: commonOptionsSchema.keys({
            key: Joi.number().integer().required(),
            tabs: Joi.array().items(Joi.object({
                label: Joi.string().required(),
                icon: Joi.string(),
                tooltip: Joi.string()
            })).min(1).required(),
            tabPos: Joi.string().valid('top', 'bottom', 'left', 'right'),
            tabBorders: Joi.number().integer().min(0),
            activeTab: Joi.number().integer().min(0),
            expand: Joi.boolean(),
            stack: Joi.boolean()
        }),
        notification: commonOptionsSchema.keys({
            command: Joi.string(),
            listen: Joi.boolean(),
            menu: Joi.string(),
            separator: Joi.string(),
            itemSeparator: Joi.string(),
            noMiddle: Joi.boolean(),
            hidden: Joi.boolean(),
            iconSize: Joi.number().integer().positive()
        }),
        appindicator: commonOptionsSchema.keys({
            listen: Joi.boolean(),
            menu: Joi.string(),
            separator: Joi.string(),
            itemSeparator: Joi.string(),
            hidden: Joi.boolean()
        }),
        popup: commonOptionsSchema.keys({
            transparent: Joi.number().integer().min(0).max(100),
            timeout: Joi.number().integer().min(0),
            keep: Joi.boolean(),
            align: Joi.string().valid('left', 'center', 'right')
        }),
        print: commonOptionsSchema.keys({
            type: Joi.string().valid('TEXT', 'IMAGE', 'RAW'),
            filename: Joi.string(),
            headers: Joi.boolean(),
            addPreview: Joi.boolean(),
            fontName: Joi.string()
        }),
        progress: commonOptionsSchema.keys({
            bars: Joi.array().items(Joi.object({
                label: Joi.string(),
                type: Joi.string().valid('NORM', 'RTL', 'PULSE', 'CPULSE')
            })),
            vertical: Joi.boolean(),
            align: Joi.string().valid('left', 'center', 'right'),
            progressText: Joi.string(),
            hideText: Joi.boolean(),
            rtl: Joi.boolean(),
            autoClose: Joi.boolean(),
            autoKill: Joi.boolean(),
            pulsate: Joi.boolean(),
            continuous: Joi.boolean(),
            scroll: Joi.boolean(),
            enableLog: Joi.alternatives().try(Joi.boolean(), Joi.string()),
            logOnTop: Joi.boolean(),
            logExpanded: Joi.boolean(),
            logHeight: Joi.number().integer().positive(),
            initialValues: Joi.array().items(Joi.number())
        }),
        scale: commonOptionsSchema.keys({
            value: Joi.number(),
            minValue: Joi.number(),
            maxValue: Joi.number(),
            step: Joi.number().positive(),
            enforceStep: Joi.boolean(),
            page: Joi.number().positive(),
            printPartial: Joi.boolean(),
            hideValue: Joi.boolean(),
            vertical: Joi.boolean(),
            invert: Joi.boolean(),
            incButtons: Joi.boolean(),
            marks: Joi.array().items(Joi.object({
                name: Joi.string(),
                value: Joi.number().required()
            }))
        }),
        'text-info': commonOptionsSchema.keys({
            filename: Joi.string(),
            editable: Joi.boolean(),
            wrap: Joi.boolean(),
            formatted: Joi.boolean(),
            justify: Joi.string().valid('left', 'right', 'center', 'fill'),
            margins: Joi.number().integer().min(0),
            tail: Joi.boolean(),
            line: Joi.number().integer().positive(),
            showCursor: Joi.boolean(),
            showUri: Joi.boolean(),
            fore: Joi.string(),
            back: Joi.string(),
            uriColor: Joi.string(),
            listen: Joi.boolean(),
            inPlace: Joi.boolean(),
            fileOp: Joi.boolean(),
            disableSearch: Joi.boolean(),
            confirmSave: Joi.alternatives().try(Joi.boolean(), Joi.string()),
            content: Joi.string(),
            lang: Joi.string(),
            theme: Joi.string(),
            mime: Joi.string(),
            lineNum: Joi.boolean(),
            lineHl: Joi.boolean(),
            lineMarks: Joi.boolean(),
            mark1Color: Joi.string(),
            mark2Color: Joi.string(),
            rightMargin: Joi.alternatives().try(Joi.boolean(), Joi.number().integer()),
            brackets: Joi.boolean(),
            indent: Joi.boolean(),
            smartHe: Joi.string().valid('newer', 'before', 'after', 'always'),
            smartBs: Joi.boolean(),
            tabWidth: Joi.number().integer().positive(),
            indentWidth: Joi.number().integer().positive(),
            spaces: Joi.boolean()
        }),
        paned: commonOptionsSchema.keys({
            key: Joi.number().integer().required(),
            orient: Joi.string().valid('horizontal', 'vertical'),
            splitter: Joi.number().integer().min(0),
            focused: Joi.number().valid(1, 2)
        }),
        picture: commonOptionsSchema.keys({
            size: Joi.string().valid('fit', 'orig'),
            inc: Joi.number().integer().positive(),
            filename: Joi.string(),
            fileOp: Joi.boolean(),
            imageChanged: Joi.string(),
            filenames: Joi.array().items(Joi.string())
        })
    };
