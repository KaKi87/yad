/**
 * AUTO-GENERATED from data/yad.1 — do not edit.
 * Regenerate with: bun run generate
 */

export type DialogMode =
    | 'message'
    | 'about'
    | 'app'
    | 'appindicator'
    | 'calendar'
    | 'color'
    | 'dnd'
    | 'entry'
    | 'file'
    | 'font'
    | 'form'
    | 'html'
    | 'icons'
    | 'list'
    | 'notebook'
    | 'notification'
    | 'paned'
    | 'picture'
    | 'popup'
    | 'print'
    | 'progress'
    | 'scale'
    | 'text-info'
;

export type ModeFlagMap = {
    'message': null;
    'about': '--about';
    'app': '--app';
    'appindicator': '--appindicator';
    'calendar': '--calendar';
    'color': '--color';
    'dnd': '--dnd';
    'entry': '--entry';
    'file': '--file';
    'font': '--font';
    'form': '--form';
    'html': '--html';
    'icons': '--icons';
    'list': '--list';
    'notebook': '--notebook';
    'notification': '--notification';
    'paned': '--paned';
    'picture': '--picture';
    'popup': '--popup';
    'print': '--print';
    'progress': '--progress';
    'scale': '--scale';
    'text-info': '--text-info';
};

export const MODE_FLAGS: ModeFlagMap = {
    'message': null,
    'about': '--about',
    'app': '--app',
    'appindicator': '--appindicator',
    'calendar': '--calendar',
    'color': '--color',
    'dnd': '--dnd',
    'entry': '--entry',
    'file': '--file',
    'font': '--font',
    'form': '--form',
    'html': '--html',
    'icons': '--icons',
    'list': '--list',
    'notebook': '--notebook',
    'notification': '--notification',
    'paned': '--paned',
    'picture': '--picture',
    'popup': '--popup',
    'print': '--print',
    'progress': '--progress',
    'scale': '--scale',
    'text-info': '--text-info',
};

export const DIALOG_METHODS = {
    'message': 'message',
    'about': 'about',
    'app': 'chooseApp',
    'appindicator': 'appIndicator',
    'calendar': 'calendar',
    'color': 'color',
    'dnd': 'dnd',
    'entry': 'entry',
    'file': 'file',
    'font': 'font',
    'form': 'form',
    'html': 'html',
    'icons': 'icons',
    'list': 'list',
    'notebook': 'notebook',
    'notification': 'notification',
    'paned': 'paned',
    'picture': 'picture',
    'popup': 'popup',
    'print': 'print',
    'progress': 'progress',
    'scale': 'scale',
    'text-info': 'textInfo',
} as const;

/** General + file-filter/preview options shared by dialogs. */
export type GeneratedCommonOptions = {
    /** Add preview widget. Preview images loads from normal (default) or large thumbnails according to XDG Thumbnails specification v0.8.0 (http://standards.freedesktop.org/thumbnail-spec/latest/) or creates by yad for image files and saves as normal or large thumbnails. */
    addPreview?: boolean;
    /** Print result for any of the return codes. This option doesn't work if timeout was reached or Escape was pressed. */
    alwaysPrintResult?: boolean;
    /** Set the output type of boolean values to TYPE. Possible types are T, t, Y, y, O, o and 1. T and t - for true/false pair in appropriate case. Y and y - for yes/no pair in appropriate case. O and o - for on/off pair in appropriate case. 1 - for 1/0 pair. */
    boolFmt?: 'T' | 't' | 'Y' | 'y' | 'O' | 'o' | '1';
    /** Set dialog window borders. */
    borders?: number;
    /** Set buttons layout type. Possible types are: spread, edge, start, end or center. Default is end. */
    buttonsLayout?: 'spread' | 'edge' | 'start' | 'end' | 'center';
    /** Place window on center of screen. */
    center?: boolean;
    /** Close the dialog window when it loses focus. */
    closeOnUnfocus?: boolean;
    /** Read and parse additional GTK+ CSS styles from given data. If STRING is filename, the content of file is loaded. If not STRING treats like CSS data. */
    css?: string;
    /** Enable spell checking in textview widgets */
    enableSpell?: boolean;
    /** Escape acts like pressing OK button. */
    escapeOk?: boolean;
    /** Hide main widget with expander. TEXT is an optional argument with expander's label. */
    expander?: string | boolean;
    /** Set the command running when F1 was pressed. */
    f1Action?: string;
    /** Make window fixed width and height. */
    fixed?: boolean;
    /** Run dialog in fullscreen mode. This option may not work on all window managers. */
    fullscreen?: boolean;
    /** Use standard X Window geometry notation for placing dialog. When this option is used, width, height, posx, posy, mouse and center options are ignored. */
    geometry?: string;
    /** Read and parse additional GTK+ CSS styles from given file. This option is deprecated. Use --css instead. */
    /** @deprecated */
    gtkrc?: string;
    /** Set the dialog window height. */
    height?: number;
    /** Set the policy type for horizontal scrollbars. TYPE can be one of the auto, always or never. Default is auto. */
    hscrollPolicy?: 'auto' | 'always' | 'never';
    /** Use specified GTK icon theme instead of default. */
    iconTheme?: string;
    /** Set the dialog image which appears on the left side of dialog`s text. IMAGE might be file name or icon name from current icon theme. */
    image?: string;
    /** Add specified path to the standard list of directories for looking for icons. This option can be used multiple times. */
    imagePaths?: string[];
    /** Don't scale icons. This option affects icons outside icon theme. */
    keepIconSize?: boolean;
    /** Send SIGNAL to parent process. Default value of SIGNAL is a SIGTERM. SIGNAL may be specified by it's number or symbolic name with or without SIG prefix. See signal(7) for details about signals. */
    killParent?: string | boolean;
    /** Use large previews by default. This option can be permanently turned on through yad settings. */
    largePreview?: boolean;
    /** Run dialog window maximized. */
    maximized?: boolean;
    /** Place window under mouse position. */
    mouse?: boolean;
    /** Don't show buttons. */
    noButtons?: boolean;
    /** Don't close dialog if Escape was pressed. */
    noEscape?: boolean;
    /** Dialog window never take focus. */
    noFocus?: boolean;
    /** Don't use pango markup in dialog's text. */
    noMarkup?: boolean;
    /** Place window over other windows. */
    onTop?: boolean;
    /** Run dialog in plug mode for swallow as a notebook tab. See NOTEBOOK section for more. */
    plug?: number;
    /** Set the X position of dialog window. NUMBER can be negative. */
    posX?: number;
    /** Set the Y position of dialog window. NUMBER can be negative. */
    posY?: number;
    /** Output X Window ID of a yad's window to the specified file or stderr. */
    printXid?: string | boolean;
    /** Set default exit code to NUMBER instead of 0. */
    response?: number;
    /** Read extra arguments from given file instead of command line. Each line of a file treats as a single argument. */
    rest?: string;
    /** If set, user can select dialog's text and copy it to clipboard. This option also affects on label fields in form dialog. */
    selectableLabels?: boolean;
    /** Don't show window in taskbar and pager. */
    skipTaskbar?: boolean;
    /** Set spell checking language to LANGUAGE. By default language guesses from current locale. Use yad-tools(1) to get list of all possible languages. */
    spellLang?: string;
    /** Make window visible on all desktops. */
    sticky?: boolean;
    /** Set the tab number for plugged dialog. See NOTEBOOK section for more. */
    tabNum?: number;
    /** Set the dialog text. */
    text?: string;
    /** Set type of dialog text justification. TYPE may be left, right, center or fill. */
    textAlign?: 'left' | 'right' | 'center' | 'fill';
    /** Set the maximum dialog text width in characters. */
    textWidth?: number;
    /** Set the dialog timeout in seconds. */
    timeout?: number;
    /** Show timeout indicator in given position. Positions are top, bottom, left or right. Style of indicator may be set through the users CSS styles. */
    timeoutIndicator?: 'top' | 'bottom' | 'left' | 'right';
    /** Set the dialog title. */
    title?: string;
    /** Make window undecorated (remove title and window borders). */
    undecorated?: boolean;
    /** Use CMD as uri handler. By default yad uses open-command parameter from settings. URI replace %s in command string or adds as a last part of command line. */
    uriHandler?: string;
    /** All commands runs under specified interpreter. Default is bash -c "%s". This option can reduse quoting in commands. If %s is specified, it will be replaced by the command. Otherwise command will be appended to the end of command line. */
    useInterp?: string | boolean;
    /** Set the policy type for vertical scrollbars. TYPE can be one of the auto, always or never. Default is auto. */
    vscrollPolicy?: 'auto' | 'always' | 'never';
    /** Set the dialog window width. */
    width?: number;
    /** Set the window icon. */
    windowIcon?: string;
    /** Create a window with the specified window type. TYPECan be one of normal, dialog, utility, dock, desktop, tooltip, notification or splash. The behavior of each window type depends on your window manager. See EWMH specification for details. NOTE: Tiling window managers will often float a "dialog" window but tile a "normal" window. */
    windowType?: 'normal' | 'dialog' | 'utility' | 'dock' | 'desktop' | 'tooltip' | 'notification' | 'splash';
    /** Set current working directory to PATH. */
    workdir?: string;
    /** Write yad settings to a file. See SETTINGS section. */
    writeSettings?: boolean;
};

export type AboutGeneratedOptions = {
    /** Set list of programm authors separated by comma. */
    authors?: string;
    /** Set programm detailed description. */
    comments?: string;
    /** Set programm copyrightstring. */
    copyright?: string;
    /** Set programm icon name. */
    image?: string;
    /** Set programm license. The value of this option can be one of predefined licenses (GPL2, GPL3, LGPL2, LGPL3, BSD, MIT or ARTISTIC,), file name with license text or arbitrary string. */
    license?: string;
    /** Set programm name. */
    programName?: string;
    /** Set programm version string. */
    programVersion?: string;
    /** Set a link to programm website. */
    website?: string;
    /** Set a label for programm website link. */
    websiteLabel?: string;
};

export type AppGeneratedOptions = {
    /** Show all available applications. */
    enableAll?: boolean;
    /** Show fallback applications. */
    enableFallback?: boolean;
    /** Show other applications. */
    enableOther?: boolean;
    /** Shown extended information about choosen application. By default only executable is shown. In extended form the output fields are name, display name, description, icon and executable. Additional argument for application dialog is a mime-type. If mime-type is not specified text/plain will be used. */
    extended?: boolean;
};

export type AppindicatorGeneratedOptions = {
    /** Doesn't show icon at startup. */
    hidden?: boolean;
    /** Set separator character for menu items. Default is !. */
    itemSeparator?: string;
    /** Listen for commands on stdin. See NOTIFICATION section. */
    listen?: boolean;
    /** Set initial menu for right-click. */
    menu?: string;
    /** Set separator character for menu values. Default is |. */
    separator?: string;
};

export type CalendarGeneratedOptions = {
    /** Set the format for the returned date. By default is `%x'. See strftime(3) for more details. */
    dateFormat?: string;
    /** Set the calendar day. */
    day?: number;
    /** Read days description from FILENAME. File with days details must be in following format: <date> <description> date field is date in format, specified with --date-format option. description is a string with date details, which may include Pango markup. */
    details?: string;
    /** Set the calendar month. */
    month?: number;
    /** Run specified command on selecting date. Selected date adds at the end of a command in form YEAR MONTH DAY. */
    selectAction?: string;
    /** Show the week numbers at the left side of calendar. */
    showWeeks?: boolean;
    /** Set the calendar year. */
    year?: number;
};

export type ColorGeneratedOptions = {
    /** Add opacity to output color string. */
    alpha?: boolean;
    /** Expander for list of user-defined colors will be initially opened. */
    expandPalette?: boolean;
    /** Show system palette inside color dialog. For GTK+3 builds this option shows palette instead of color editor. */
    gtkPalette?: boolean;
    /** Set initial color value. */
    initColor?: string;
    /** Set output color mode. Possible values are hex or rgb. Default is hex. HEX mode looks like #rrggbbaa, RGB mode - rgba(r, g, b, a). In RGBA mode opacity have values from 0.0 to 1.0. */
    mode?: 'hex' | 'rgb';
    /** Show palette and set predefined colors from given filename. By default yad use file /etc/X11/rgb.txt. */
    palette?: string | boolean;
    /** Add screen color picker button. */
    picker?: boolean;
};

export type DndGeneratedOptions = {
    /** Run command when data received. Data strings pass to command as an argument or replace %s modifier in a command. By default data just prints to stdout. */
    command?: string;
    /** Exit after NUMBER of drops was reached. 0 means infinite number of drops, this is the default. */
    exitOnDrop?: number;
    /** Use dialog text as a tooltip for Drag-and-Drop box. */
    tooltip?: boolean;
};

export type EntryGeneratedOptions = {
    /** Use specific type for extended completion. TYPE can be any for match any of typed words, all for match all of typed words or regex when typed text treats as regular expression. */
    complete?: 'any' | 'all' | 'regex';
    /** Use completion instead of combo-box. */
    completion?: boolean;
    /** Allow make changes to text in combo-box. */
    editable?: boolean;
    /** Set the entry label text. */
    entryLabel?: string;
    /** Set the initial entry text or default item in combo-box. */
    entryText?: string;
    /** Set precision of floating point numbers. By default precision is three digits after point. */
    floatPrecision?: number;
    /** Hide the entry text. */
    hideText?: boolean;
    /** Set an icon on a left side of entry. */
    licon?: string;
    /** Specify a command which will be run when the left icon clicked. Output of command will be set as entry text. */
    liconAction?: string;
    /** Output index of active element instead of text for combo-box entry. Any extra data specified in command line adds as an items of combo-box entry, except of numeric mode. If icon specified and icon action is not given, click on icon just clear the entry. Numeric fields will ignore the icons. */
    numOutput?: boolean;
    /** Use spin button instead of text entry. Additional parameters in command line treats as minimum and maximum values, step value and precisions (in that order). All this values are optional. Default range is from 0 to 65535 with step 1. */
    numeric?: boolean;
    /** Set an icon on a right side of entry. */
    ricon?: string;
    /** Specify a command which will be run when the right icon clicked. Output of command will be set as entry text. */
    riconAction?: string;
};

export type FileGeneratedOptions = {
    /** Confirm file selection if filename already exists. Optional argument is a text for confirmation dialog. */
    confirmOverwrite?: string | boolean;
    /** Activate directory-only selection. */
    directory?: boolean;
    /** Set the filename. */
    filename?: string;
    /** Allow selection of multiple filenames in file selection dialog. */
    multiple?: boolean;
    /** Output values will be shell-style quoted. */
    quotedOutput?: boolean;
    /** Activate save mode. */
    save?: boolean;
    /** Specify separator character when returning multiple filenames. */
    separator?: string;
};

export type FontGeneratedOptions = {
    /** Set the initial font. FONTNAME is a string with font representation in the form "[FAMILY-LIST] [STYLE-OPTIONS] [SIZE]". */
    fontname?: string;
    /** Set the preview text. */
    preview?: boolean;
    /** Output data will be in shell-style quotes. */
    quotedOutput?: boolean;
    /** Separate output of selected font description. */
    separateOutput?: boolean;
    /** Set output separator character. Default is `|'. */
    separator?: string;
};

export type FormGeneratedOptions = {
    /** Set alignment of field labels. Possible types are left, center or right. Default is left. */
    align?: 'left' | 'center' | 'right';
    /** Align label on button fields according to --align settings. */
    alignButtons?: boolean;
    /** Run CMD when CHK, CB, or SW field value is changed. Command runs with two arguments - number of changed field and its current value. Output of a command parsing in a same manner as in BTN fields with @ prefix. Attention - this option may slow down your dialog. */
    changedAction?: string;
    /** Set number of columns in form. Fields will be placed from top to bottom. */
    columns?: number;
    /** Use specific type for extended completion. TYPE can be any for match any of typed words, all for match all of typed words or regex when typed text treats as regular expression. */
    complete?: 'any' | 'all' | 'regex';
    /** Cycled reading of stdin data. Sending FormFeed character clears the form. This symbol may be sent as echo -e '\\f'. */
    cycleRead?: boolean;
    /** Set the format for the date fields (same as in calendar dialog). */
    dateFormat?: string;
    /** Set precision of floating point numbers. By default precision is three digits after point. */
    floatPrecision?: number;
    /** Set focused field. */
    focusField?: number;
    /** Makes form fields height ans columns width the same size. */
    homogeneous?: boolean;
    /** Set separator character for combo-box or scale values. Default is `!'. */
    itemSeparator?: string;
    /** Output index of active element instead of text for combo-box fields. Additional data in command line interprets as a default values for form fields. A special value @disabled@ makes corresponding field inactive. If no extra arguments specified in a command line, data will be readed from stdin, one value per line. Cycled reading means that for N fields N+1 value will replace the first field. Empty values are skipped when reading from stdin. */
    numOutput?: boolean;
    /** Output field values row by row if several columns is specified. */
    outputByRow?: boolean;
    /** Output values will be in shell-style quotes. */
    quotedOutput?: boolean;
    /** Make form scrollable. */
    scroll?: boolean;
    /** Set output separator character. Default is `|'. */
    separator?: string;
};

export type HtmlGeneratedOptions = {
    /** Turn on browser mode. In this mode all clicked links will be opened in html widget and command Open will be added to context menu. */
    browser?: boolean;
    /** Disable search bar. */
    disableSearch?: boolean;
    /** Set encoding of data passed to standard input to ENCODING. Default is UTF-8. */
    encoding?: string;
    /** Enable file operations. This option adds open menu item to popup menu, */
    fileOp?: boolean;
    /** Set mime type of data passed to standard input to MIME. Default is text/html. */
    mime?: string;
    /** Print clicked links to standard output. By default clicked links opens with xdg-open. */
    printUri?: boolean;
    /** Open specified location. URI can be a filename or internet address. If URI is not an existing file and protocol is not specified a prefix http:// will be added to URI. */
    uri?: string;
    /** Set external handler for clicked uri. %s will be replaced by activated uri. Return code of the CMD must be 0 for keep working, 1 for ignoring uri and 2 for downloading uri. This option works only in browser mode. There are two environment variables available in handler - YAD_HTML_BUTTON with value of pressed mouse button and YAD_HTML_STATE with value of bitmask with the the state of the modifier keys. */
    uriHandler?: string;
    /** Set user agent string. Default is YAD-Webkit (@VERSION@) */
    userAgent?: string;
    /** Load custom custom user styles from file or arbitrary data. STRING may be a path to local file with CSS code or CSS code itself. */
    userStyle?: string;
};

export type IconsGeneratedOptions = {
    /** Use compact mode. Icon and name of each item is placed in a single row. */
    compact?: boolean;
    /** Sort items in descending order. If data reads from stdin this option is useless without --sort-by-name. */
    descend?: boolean;
    /** Use field GenericName instead of Name for shortcut label. */
    generic?: boolean;
    /** Force using specified icon size. This option doesn't work in compact mode. */
    iconSize?: boolean;
    /** Set items width. */
    itemWidth?: boolean;
    /** Read data from stdin. Data must be in order - Name, Tooltip, Icon, Command, InTerm separated by newline. InTerm is a case insensitive boolean constant (TRUE or FALSE). Sending FormFeed character clears iconbox. */
    listen?: boolean;
    /** Watch for changes in directory and automatically update content of iconbox. */
    monitor?: boolean;
    /** Read .desktop files from specified directory. */
    readDir?: string;
    /** Activate items by single mouse click. This option may not works properly in case of compact mode. */
    singleClick?: boolean;
    /** Use field Name instead of filename for sorting items. */
    sortByName?: boolean;
    /** Pattern for terminal. By default use `xterm -e %s' where %s replaced by the command. If both directory and stdin specified, content of iconbox will be read from directory. */
    term?: boolean;
};

export type ListGeneratedOptions = {
    /** Add new records at the top of the list. */
    addOnTop?: boolean;
    /** Use check boxes for the first column. Output checked rows instead of selected rows. Disable multiple selection. */
    checklist?: boolean;
    /** Set alignment for columns. STRING must contain array of letters l, r or c for left, center or right alignment of column content. */
    columnAlign?: string;
    /** Set the CMD as a double-click command. When user double-clicked on row, CMD will be launched with values of all columns as an arguments. By default double-click selects row and act as OK button for simple lists, set the checkbox if --checklist specified and do nothing when list run with --multiple option. When double-click specified Enter acts as a double-click and Ctrl+Enter acts as an OK button. CMD may contain a special character `%s' for setting a position for arguments. By default arguments will be concatenated to the end of CMD. If CMD starts with @, its output will replace values of current row. This option doesn't work with --editable. */
    dclickAction?: string;
    /** Allow changes to text. */
    editable?: boolean;
    /** Set the list of editable columns. LIST must be a string of numbers separated by comma. */
    editableCols?: string;
    /** Set ellipsize mode for text columns. TYPE may be NONE, START, MIDDLE or END. */
    ellipsize?: 'none' | 'start' | 'middle' | 'end';
    /** Set the list of ellipsized columns. LIST must be a string of numbers separated by comma. */
    ellipsizeCols?: string;
    /** Set the column expandable by default. 0 sets all columns expandable. */
    expandColumn?: number;
    /** Set precision of floating point numbers. By default precision is three digits after point. */
    floatPrecision?: number;
    /** Draw grid lines of type TYPE in list dialog. TYPE can be one of the hor[izontal], vert[ical] of both. */
    gridLines?: 'hor' | 'vert' | 'both';
    /** Set alignment for column headers. STRING same as in --column-align. Sending FormFeed character to list clears it. This symbol may be sent as echo -e '\\f'. */
    headerAlign?: string;
    /** Use header name as a fallback tooltip text. */
    headerTips?: boolean;
    /** Hide a specific column. */
    hideColumn?: number;
    /** Use IEC (base 1024) units with for size values. With this option values will have suffixes KiB, MiB, GiB. */
    iecFormat?: boolean;
    /** Set the number of rows in list dialog. Will be shown only the last NUMBER rows. This option will take effect only when data reading from stdin. */
    limit?: number;
    /** Listen data from stdin even if command-line values was specified. */
    listen?: boolean;
    /** Allow multiple rows to be selected. */
    multiple?: boolean;
    /** Disable sorting of column content by clicking on its header. */
    noClick?: boolean;
    /** Do not show column headers. */
    noHeaders?: boolean;
    /** Don't draw even and odd rows by a different colors. This option depends on your current gtk theme and may not work. */
    noRulesHint?: boolean;
    /** Disable selection in list. */
    noSelection?: boolean;
    /** Print all data from the list. */
    printAll?: boolean;
    /** Specify what column will be printed to standard output. 0 may be used to print all columns (this is default). */
    printColumn?: number;
    /** Output values will be shell-style quoted. */
    quotedOutput?: boolean;
    /** Same as --checklist but with a radio toggle for the first column. */
    radiolist?: boolean;
    /** Use regular expressions in search for text fields. */
    regexSearch?: boolean;
    /** Set the CMD as a action when the row is added, modified or removed. First argument for the command is the name of action (add, edit or del). The rest of command line is data from selected row. Output of this command sets the new row values. */
    rowAction?: string;
    /** Set the quick search column. 0 mean to disable searching. By default search mades on first column. */
    searchColumn?: number;
    /** Set the CMD as a action when selection is changed. CMD will be launched with values of all columns as an arguments. CMD may contain a special character `%s' for setting a position for arguments. By default arguments will be concatenated to the end of CMD. This option doesn't work with --multiple. */
    selectAction?: string;
    /** Set the row separator column. If the cell value from this column equal to specified row separator value such row will be draw as separator. Separator value must be set. */
    sepColumn?: number;
    /** Set the TEXT as a row separator value. This feature highly depends on your current GTK+ theme and may not work properly. */
    sepValue?: string;
    /** Set output separator characters. */
    separator?: string;
    /** Don't use markup in tooltips even if text has a valid markup. */
    simpleTips?: boolean;
    /** Autoscroll to the end of the list when a new row will be added. */
    tail?: boolean;
    /** Set the column with popup tooltips. */
    tooltipColumn?: number;
    /** Enbale tree mode. In this mode extra data in form ROW_ID[:PARENT_ID] must be passed to yad before each row. See EXAMPLES for details. */
    tree?: boolean;
    /** Expand all tree nodes at startup. */
    treeExpanded?: boolean;
    /** Set the list of wrapped columns. LIST must be a string of numbers separated by comma. */
    wrapCols?: string;
    /** Set the width of column before wrapping to NUMBER. */
    wrapWidth?: number;
};

export type NotebookGeneratedOptions = {
    /** Set active tab. */
    activeTab?: number;
    /** Expand all tabs to full width of a dialog window. */
    expand?: boolean;
    /** Set the key of the children. */
    key?: number;
    /** Use stack mode (GtkStack instead of GtkNotebook). See NOTEBOOK and PANED section for more about notebook dialog. */
    stack?: boolean;
    /** Set the borders width around widget in tabs. */
    tabBorders?: number;
    /** Set the tabs position. Value may be top, bottom, left, or right. Default is top. For stack mode only top or bottom positions available. */
    tabPos?: 'top' | 'bottom' | 'left' | 'right';
};

export type NotificationGeneratedOptions = {
    /** Set the command running when clicked on the icon. Default action is quit if --listen not specified. */
    command?: string;
    /** Doesn't show icon at startup. */
    hidden?: boolean;
    /** Set notification icon size to SIZE. This option doesn't works for themed icons. See NOTIFICATION section for more about separators. */
    iconSize?: number;
    /** Set separator character for menu items. Default is !. */
    itemSeparator?: string;
    /** Listen for commands on stdin. See NOTIFICATION section. */
    listen?: boolean;
    /** Set initial menu for right-click. */
    menu?: string;
    /** Disable exit on middle click. */
    noMiddle?: boolean;
    /** Set separator character for menu values. Default is |. */
    separator?: string;
};

export type PanedGeneratedOptions = {
    /** Set pane for initial focus. PANE must be 1 or 2. Default is 1. See NOTEBOOK and PANED section for more about paned dialog. */
    focused?: number;
    /** Set the key of the children. */
    key?: number;
    /** Set orientation of panes inside dialog. TYPE may be in hor[izontal] or vert[ical]. */
    orient?: 'hor' | 'vert' | 'horizontal' | 'vertical';
    /** Set the initial splitter position. */
    splitter?: number;
};

export type PictureGeneratedOptions = {
    /** Enable file operations. This option adds open menu item to popup menu, */
    fileOp?: boolean;
    /** Set picture filename. If no file name is specified extra data will be used. In this case several filenames can be specified. */
    filename?: string;
    /** Set command which runs after changing image. Argument of a command is a filename of current image. Argument can be specified by '%s' pattern or will be the last part of a command. Some actions on a picture like navigation, scaling or rotating available from popup menu. Those actions can be made only on static images. */
    imageChanged?: string;
    /** Set increment value for scaling image. */
    inc?: number;
    /** Set initial size of picture. Available values are fit for fitting image in window or orig for show picture in original size. */
    size?: 'fit' | 'orig';
};

export type PopupGeneratedOptions = {
    /** Set alignment of popup title and text. TYPE can be one of left, center or right. */
    align?: 'left' | 'center' | 'right';
    /** Don't close popup window automatically. By default window will be closed after TIMEOUT seconds. */
    keep?: boolean;
    /** Change default timeout. By default timeout is a 300 seconds. */
    timeout?: number;
    /** Make popup window transparent. */
    transparent?: number;
};

export type PrintGeneratedOptions = {
    /** Add Preview button to the print dialog. This option doesn't work for RAW type. */
    addPreview?: boolean;
    /** Set name or path to the source file. */
    filename?: string;
    /** Set the font for printing text. FONTNAME is a string with font representation in the form "[FAMILY-LIST] [STYLE-OPTIONS] [SIZE]". This option works only for TEXT type. */
    fontname?: string;
    /** Add headers to the top of page with filename and page number. This option doesn't work for RAW type. */
    headers?: boolean;
    /** Set source file type. TYPE may be a TEXT for text files, IMAGE for image files or RAW for files in postscript or pdf formats. */
    type?: 'files' | 'IMAGE' | 'image' | 'RAW' | 'postscript' | 'pdf' | 'formats';
};

export type ProgressGeneratedOptions = {
    /** Set alignment of bar labels. Possible types are left, center or right. Default is left. */
    align?: 'left' | 'center' | 'right';
    /** Close dialog when 100% has been reached. */
    autoClose?: boolean;
    /** Kill parent process if cancel button is pressed. */
    autoKill?: boolean;
    /** Continuously pulsating progress bar. This option works only in single-bar mode. */
    continuous?: boolean;
    /** Show log window. This window gathers all of lines from stdin, started from # instead of setting appropriate progress text. Optional argument TEXT is a text label for window expander. */
    enableLog?: string | boolean;
    /** Hide text in progress bars. */
    hideText?: boolean;
    /** Start with expanded log window. */
    logExpanded?: boolean;
    /** Set the height of log window. Initial values for bars sets as an extra arguments. Each lines with progress data passed to stdin must be started from N: where N is a number of progress bar. In a single-bar mode N: is not needed. */
    logHeight?: boolean;
    /** Place log window above progress bars. */
    logOnTop?: boolean;
    /** Set the label of progress bar to TEXT. This option works only in single-bar mode. */
    progressText?: string;
    /** Pulsate progress bar. This option works only in single-bar mode. */
    pulsate?: boolean;
    /** Set Right-To-Left progress bar direction. This option works only in single-bar mode. */
    rtl?: boolean;
    /** Make layout scrollable. */
    scroll?: boolean;
    /** Set vertical orientation of progress bars. */
    vertical?: boolean;
};

export type ScaleGeneratedOptions = {
    /** Only allow values in step increments. */
    enforceStep?: boolean;
    /** Hide value. */
    hideValue?: boolean;
    /** Show buttons on edges of a scale for increasing or decreasing scale value. */
    incButtons?: boolean;
    /** Invert scale direction. */
    invert?: boolean;
    /** Set maximum value. */
    maxValue?: number;
    /** Set minimum value. */
    minValue?: number;
    /** Set paging size. By default page value is STEP*10. */
    page?: number;
    /** Print partial values. */
    printPartial?: boolean;
    /** Set step size. */
    step?: number;
    /** Set initial value. */
    value?: number;
    /** Show vertical scale. */
    vertical?: boolean;
};

export type TextInfoGeneratedOptions = {
    /** Set default color for background. */
    back?: string;
    /** Highlight matching brackets. */
    brackets?: boolean;
    /** Confirm file saving if file content was changed. This option works only when --in-place is specified. Optional argument is a text for confirmation dialog. */
    confirmSave?: string | boolean;
    /** Disable search bar. */
    disableSearch?: boolean;
    /** Allow changes to text. */
    editable?: boolean;
    /** Enable file operations. This option adds open and save menu items to popup menu, This option works only in editable mode. */
    fileOp?: boolean;
    /** Open specified file. */
    filename?: string;
    /** Set default color for text. */
    fore?: string;
    /** Enable Pango markup. This option doesn't work with --editable option. */
    formatted?: boolean;
    /** Save file on exit instead of print it content on stdout. This option works only if file was specified from command-line. */
    inPlace?: boolean;
    /** Enable autoindent. This option also sets TAB key as indent key. */
    indent?: boolean;
    /** Set indentation step. */
    indentWidth?: boolean;
    /** Set justification. TYPE may be left, right, center or fill. Default is left. */
    justify?: 'left' | 'right' | 'center' | 'fill';
    /** Highlight syntax for specified LANGUAGE. */
    lang?: string;
    /** Jump to specific line at startup. This option works only when filename was specified */
    line?: number;
    /** Highlight current line. */
    lineHl?: boolean;
    /** Enable line marks mode. There are two types of marks. First type sets by left mouse button and second by the right mouse button. */
    lineMarks?: boolean;
    /** Show line numbers. */
    lineNum?: boolean;
    /** Listen data from stdin even if filename was specified. */
    listen?: boolean;
    /** Set text margins to NUMBER. */
    margins?: number;
    /** Set background color for marks of first type to COLOR. Default is lightgreen. */
    mark1Color?: string;
    /** Set background color for marks of second type to COLOR. Default is pink. */
    mark2Color?: string;
    /** Specify mime type of input data. This options only needed for guessing appropriate syntax highlighting. */
    mime?: string;
    /** Enable mark of right margin. Optional argument POS is a margin position in characters. Default is 80. */
    rightMargin?: string | boolean;
    /** Show cursor in read-only mode. */
    showCursor?: boolean;
    /** Make links in text clickable. Links opens with xdg-open command. */
    showUri?: boolean;
    /** Enable smart mode for BackSpace. If this option is enabled BackSpace will delete spaces to the next tab position. */
    smartBs?: boolean;
    /** Set behavior of HOME and END keys. The TYPE is one of newer, before, after or always. */
    smartHe?: string;
    /** Insert spaces instead of tabulation. If fontname option is specified for text dialog, the description of font must be in CSS style (not in a Pango style). Sending FormFeed character to text dialog clears it. This symbol may be sent as echo -e '\\f'. Pressing Ctrl+S popups the search entry in text dialog. */
    spaces?: boolean;
    /** Set tabulation step. */
    tabWidth?: boolean;
    /** Autoscroll to end when new text appears. This option works only when text is read from stdin. */
    tail?: boolean;
    /** Set used theme to THEME. Use yad-tools(1) to get list of all available themes. */
    theme?: string;
    /** Set color for links. Default is blue. */
    uriColor?: string;
    /** Enable text wrapping. */
    wrap?: boolean;
};

export type GeneratedModeOptions = {
    'message': GeneratedCommonOptions;
    'about': GeneratedCommonOptions & AboutGeneratedOptions;
    'app': GeneratedCommonOptions & AppGeneratedOptions;
    'appindicator': GeneratedCommonOptions & AppindicatorGeneratedOptions;
    'calendar': GeneratedCommonOptions & CalendarGeneratedOptions;
    'color': GeneratedCommonOptions & ColorGeneratedOptions;
    'dnd': GeneratedCommonOptions & DndGeneratedOptions;
    'entry': GeneratedCommonOptions & EntryGeneratedOptions;
    'file': GeneratedCommonOptions & FileGeneratedOptions;
    'font': GeneratedCommonOptions & FontGeneratedOptions;
    'form': GeneratedCommonOptions & FormGeneratedOptions;
    'html': GeneratedCommonOptions & HtmlGeneratedOptions;
    'icons': GeneratedCommonOptions & IconsGeneratedOptions;
    'list': GeneratedCommonOptions & ListGeneratedOptions;
    'notebook': GeneratedCommonOptions & NotebookGeneratedOptions;
    'notification': GeneratedCommonOptions & NotificationGeneratedOptions;
    'paned': GeneratedCommonOptions & PanedGeneratedOptions;
    'picture': GeneratedCommonOptions & PictureGeneratedOptions;
    'popup': GeneratedCommonOptions & PopupGeneratedOptions;
    'print': GeneratedCommonOptions & PrintGeneratedOptions;
    'progress': GeneratedCommonOptions & ProgressGeneratedOptions;
    'scale': GeneratedCommonOptions & ScaleGeneratedOptions;
    'text-info': GeneratedCommonOptions & TextInfoGeneratedOptions;
};

