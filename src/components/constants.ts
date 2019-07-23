const styles = require(".././css/_variables.scss");

import * as buildings from "../data/buildings.json";
import { items } from "../data/menu.json";
import { IBuildingData } from "./buildings.js";
import { Direction, MenuItemId } from "./enums";
import { IMenuItem } from "./menu.js";

interface IGridRange {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

type Point = [number, number];

class Constants {
    static readonly DEBUG_MODE_ENABLED = true;

    static readonly TILE_WIDTH = styles.tileWidth;
    static readonly TILE_HEIGHT = styles.tileHeight;
    static readonly TILESHEET_URL = "/assets/Phoebus_cleaned.png"; // "/assets/Phoebus_16x16.png";

    static readonly MENU_WIDTH_INITIAL: number = Number(styles.menuWidth);
    static readonly HEADER_HEIGHT_INITIAL: number = Number(styles.headerHeight);

    static readonly GRID_TILE_COLOR_PERCENT: number = 50; // #/100 likelihood of a decorated tile to be colored
    static readonly GRID_TILE_DECORATED_PERCENT: number = 15; // #/100 likelihood of an empty tile to be decorated
    static readonly GRID_TILE_DECORATED_COLORS: string[] = [
        "rgba(0,255,255,.4)", //LCYAN
        "rgba(0,255,0,.4)", //GREEN
        // "rgba(255,255,0,1)", //YELLOW
        // "rgba(255,255,255,.1)", //WHITE
        "rgba(255,255,255,.1)", //grey-ish
        "rgba(255,255,0,.4)", //natural-er yellow
    ];

    static readonly CURSOR_COLOR = "rgba(157,132,19,1)";
    static readonly CURSOR_PASSABLE_COLOR = "rgba(0,255,0,1)";
    static readonly CURSOR_IMPASSABLE_COLOR = "rgba(0,128,0,1)";
    static readonly CURSOR_INVALID_COLOR = "rgba(128,0,0,1)";

    static readonly BUILDING_TILE_MAP: { [key: string]: { "tiles": IBuildingData[][] } } = buildings as any;

    static readonly WALL_TILES: Point[][] = [
        [[112, 192]], //0000 'edge'     //0
        [[112, 192]], //0001 N 'edge'   //1
        [[112, 192]], //0010 E 'edge'   //2
        [                               //3
            [48, 208],
            [64, 208],
            [128, 192],
        ], //0011 NE
        [[112, 192]], //0100 S 'edge'   //4
        [[160, 176]], //0101 NS         //5
        [                               //6
            [80, 208],
            [96, 208],
            [144, 192],
        ], //0110 SE
        [[192, 192]], //0111 NES        //7
        [[112, 192]], //1000 W 'edge'   //8
        [                               //9
            [192, 176],
            [208, 176],
            [224, 176],
        ], //1001 NW
        [[208, 192]], //1010 EW         //10
        [[160, 192]], //1011 NEW        //11
        [                               //12
            [112, 176],
            [128, 176],
            [176, 176],
        ], //1100 SW
        [[144, 176]], //1101 NSW        //13
        [[176, 192]], //1110 SEW        //14
        [[224, 192]], //1111 4-way      //15
    ];

    static readonly FLOOR_TILES: Point[] = [
        [192, 32],
        [224, 32],
        // [0, 96],
        // [0, 176],
        // [16, 176],
        // [32, 176],
    ];

    static readonly DECORATOR_TILES: Array<{
        char: string,
        desc: string,
        coord: Point,
        colorize: boolean,
    }> = [
            {
                char: "z0",
                desc: "3 spades",
                coord: [192, 16],
                colorize: true,
            },
            {
                char: "z1",
                desc: "3 ore",
                coord: [32, 128],
                colorize: false,
            },
            {
                char: "z2",
                desc: "3 ore",
                coord: [192, 144],
                colorize: false,
            },
            {
                char: "z3",
                desc: "3 ore",
                coord: [176, 160],
                colorize: false,
            },
            {
                char: "z4",
                desc: "large spade",
                coord: [208, 16],
                colorize: true,
            },
            {
                char: "z5",
                desc: "large single ore",
                coord: [160, 32],
                colorize: true,
            },
            {
                char: "z6",
                desc: "large symmetrical ore",
                coord: [176, 128],
                colorize: false,
            },
            {
                char: "z7",
                desc: "medium ore",
                coord: [144, 160],
                colorize: false,
            },
            {
                char: "z8",
                desc: "2 ore",
                coord: [160, 160],
                colorize: false,
            },
        ];

    static readonly TILE_MAP: { [key: string]: Point; } = ((): { [key: string]: Point; } => {
        let val: { [key: string]: Point; } = {};
        val = {
            " ": [0, 0],        //empty
            "@": [16, 0],       //player?
            ".": [128, 80],     //cursor
            ",": [176, 32],     //designation
        };

        //decorator tiles `z${number}`
        Constants.DECORATOR_TILES.forEach((tile) => {
            val[tile.char] = tile.coord;
        });

        //wall tiles `w${number}${optional variant letter (a,b,c,etc)}`
        for (const key of Object.keys(Constants.WALL_TILES)) {
            if (Constants.WALL_TILES[key].length > 1) {
                for (let i = 0; i < Constants.WALL_TILES[key].length; i++) {
                    val["w" + key + String.fromCharCode(i + 97)] = Constants.WALL_TILES[key][i];
                }
            } else {
                val["w" + key] = Constants.WALL_TILES[key][0];
            }
        }

        //floor tiles `f${number}`
        for (let i = 0; i < Constants.FLOOR_TILES.length; i++) {
            val["f" + i] = Constants.FLOOR_TILES[i];
        }

        //reference by # directly
        let count = 0;
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                val["i" + count++] = [x * Constants.TILE_WIDTH, y * Constants.TILE_HEIGHT];
            }
        }

        return val;
    })();

    static readonly MENU_ITEMS = items as IMenuItem[];

    static readonly MENU_SUBMENUS: Map<string, string> = new Map();

    static readonly MENU_HOTKEYS: Map<string, IMenuItem> = (() => {
        const MENU_PARSED: Map<string, IMenuItem> = new Map();
        const parseMenuItemRecursive = (menuItems: IMenuItem[], parent?: IMenuItem) => {
            for (const item of menuItems) {
                item.parent = parent;
                let prefix = ""; // (parent != null ? parent.key + ":" : "");
                let iterParent = parent;
                while (iterParent != null) {
                    prefix = iterParent.key + ":" + prefix;
                    iterParent = iterParent.parent;
                }
                const key = prefix + item.key;
                MENU_PARSED[key] = item;
                if (item.children != null && item.children.length) {
                    Constants.MENU_SUBMENUS[item.id] = key;
                    parseMenuItemRecursive(item.children, item);
                }
            }
        };

        parseMenuItemRecursive(Constants.MENU_ITEMS);

        return MENU_PARSED;
    })();

    static readonly MENU_DICTIONARY: Map<string, IMenuItem> = (() => {
        const result: Map<string, IMenuItem> = new Map();
        for (const i of Object.keys(Constants.MENU_HOTKEYS)) {
            result[(Constants.MENU_HOTKEYS[i] as IMenuItem).id] = Constants.MENU_HOTKEYS[i];
        }
        return result;
    })();

    static readonly KEYS = {
        /** Cancel key. */
        VK_CANCEL: 3,
        /** Help key. */
        VK_HELP: 6,
        /** Backspace key. */
        VK_BACK_SPACE: 8,
        /** Tab key. */
        VK_TAB: 9,
        /** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
        VK_CLEAR: 12,
        /** Return/enter key on the main keyboard. */
        VK_RETURN: 13,
        /** Reserved, but not used. */
        VK_ENTER: 14,
        /** Shift key. */
        VK_SHIFT: 16,
        /** Control key. */
        VK_CONTROL: 17,
        /** Alt (Option on Mac) key. */
        VK_ALT: 18,
        /** Pause key. */
        VK_PAUSE: 19,
        /** Caps lock. */
        VK_CAPS_LOCK: 20,
        /** Escape key. */
        VK_ESCAPE: 27,
        /** Space bar. */
        VK_SPACE: 32,
        /** Page Up key. */
        VK_PAGE_UP: 33,
        /** Page Down key. */
        VK_PAGE_DOWN: 34,
        /** End key. */
        VK_END: 35,
        /** Home key. */
        VK_HOME: 36,
        /** Left arrow. */
        VK_LEFT: 37,
        /** Up arrow. */
        VK_UP: 38,
        /** Right arrow. */
        VK_RIGHT: 39,
        /** Down arrow. */
        VK_DOWN: 40,
        /** Print Screen key. */
        VK_PRINTSCREEN: 44,
        /** Ins(ert) key. */
        VK_INSERT: 45,
        /** Del(ete) key. */
        VK_DELETE: 46,
        /***/
        VK_0: 48,
        /***/
        VK_1: 49,
        /***/
        VK_2: 50,
        /***/
        VK_3: 51,
        /***/
        VK_4: 52,
        /***/
        VK_5: 53,
        /***/
        VK_6: 54,
        /***/
        VK_7: 55,
        /***/
        VK_8: 56,
        /***/
        VK_9: 57,
        /** Colon (:) key. Requires Gecko 15.0 */
        VK_COLON: 58,
        /** Semicolon (;) key. */
        VK_SEMICOLON: 59,
        /** Less-than (<) key. Requires Gecko 15.0 */
        VK_LESS_THAN: 60,
        /** Equals (=) key. */
        VK_EQUALS: 61,
        /** Greater-than (>) key. Requires Gecko 15.0 */
        VK_GREATER_THAN: 62,
        /** Question mark (?) key. Requires Gecko 15.0 */
        VK_QUESTION_MARK: 63,
        /** Atmark (@) key. Requires Gecko 15.0 */
        VK_AT: 64,
        /***/
        VK_A: 65,
        /***/
        VK_B: 66,
        /***/
        VK_C: 67,
        /***/
        VK_D: 68,
        /***/
        VK_E: 69,
        /***/
        VK_F: 70,
        /***/
        VK_G: 71,
        /***/
        VK_H: 72,
        /***/
        VK_I: 73,
        /***/
        VK_J: 74,
        /***/
        VK_K: 75,
        /***/
        VK_L: 76,
        /***/
        VK_M: 77,
        /***/
        VK_N: 78,
        /***/
        VK_O: 79,
        /***/
        VK_P: 80,
        /***/
        VK_Q: 81,
        /***/
        VK_R: 82,
        /***/
        VK_S: 83,
        /***/
        VK_T: 84,
        /***/
        VK_U: 85,
        /***/
        VK_V: 86,
        /***/
        VK_W: 87,
        /***/
        VK_X: 88,
        /***/
        VK_Y: 89,
        /***/
        VK_Z: 90,
        /***/
        VK_CONTEXT_MENU: 93,
        /** 0 on the numeric keypad. */
        VK_NUMPAD0: 96,
        /** 1 on the numeric keypad. */
        VK_NUMPAD1: 97,
        /** 2 on the numeric keypad. */
        VK_NUMPAD2: 98,
        /** 3 on the numeric keypad. */
        VK_NUMPAD3: 99,
        /** 4 on the numeric keypad. */
        VK_NUMPAD4: 100,
        /** 5 on the numeric keypad. */
        VK_NUMPAD5: 101,
        /** 6 on the numeric keypad. */
        VK_NUMPAD6: 102,
        /** 7 on the numeric keypad. */
        VK_NUMPAD7: 103,
        /** 8 on the numeric keypad. */
        VK_NUMPAD8: 104,
        /** 9 on the numeric keypad. */
        VK_NUMPAD9: 105,
        /** * on the numeric keypad. */
        VK_MULTIPLY: 106,
        /** + on the numeric keypad. */
        VK_ADD: 107,
        /***/
        VK_SEPARATOR: 108,
        /** - on the numeric keypad. */
        VK_SUBTRACT: 109,
        /** Decimal point on the numeric keypad. */
        VK_DECIMAL: 110,
        /** / on the numeric keypad. */
        VK_DIVIDE: 111,
        /** F1 key. */
        VK_F1: 112,
        /** F2 key. */
        VK_F2: 113,
        /** F3 key. */
        VK_F3: 114,
        /** F4 key. */
        VK_F4: 115,
        /** F5 key. */
        VK_F5: 116,
        /** F6 key. */
        VK_F6: 117,
        /** F7 key. */
        VK_F7: 118,
        /** F8 key. */
        VK_F8: 119,
        /** F9 key. */
        VK_F9: 120,
        /** F10 key. */
        VK_F10: 121,
        /** F11 key. */
        VK_F11: 122,
        /** F12 key. */
        VK_F12: 123,
        /** F13 key. */
        VK_F13: 124,
        /** F14 key. */
        VK_F14: 125,
        /** F15 key. */
        VK_F15: 126,
        /** F16 key. */
        VK_F16: 127,
        /** F17 key. */
        VK_F17: 128,
        /** F18 key. */
        VK_F18: 129,
        /** F19 key. */
        VK_F19: 130,
        /** F20 key. */
        VK_F20: 131,
        /** F21 key. */
        VK_F21: 132,
        /** F22 key. */
        VK_F22: 133,
        /** F23 key. */
        VK_F23: 134,
        /** F24 key. */
        VK_F24: 135,
        /** Num Lock key. */
        VK_NUM_LOCK: 144,
        /** Scroll Lock key. */
        VK_SCROLL_LOCK: 145,
        /** Circumflex (^) key. Requires Gecko 15.0 */
        VK_CIRCUMFLEX: 160,
        /** Exclamation (!) key. Requires Gecko 15.0 */
        VK_EXCLAMATION: 161,
        /** Double quote () key. Requires Gecko 15.0 */
        VK_DOUBLE_QUOTE: 162,
        /** Hash (#) key. Requires Gecko 15.0 */
        VK_HASH: 163,
        /** Dollar sign ($) key. Requires Gecko 15.0 */
        VK_DOLLAR: 164,
        /** Percent (%) key. Requires Gecko 15.0 */
        VK_PERCENT: 165,
        /** Ampersand (&) key. Requires Gecko 15.0 */
        VK_AMPERSAND: 166,
        /** Underscore (_) key. Requires Gecko 15.0 */
        VK_UNDERSCORE: 167,
        /** Open parenthesis (() key. Requires Gecko 15.0 */
        VK_OPEN_PAREN: 168,
        /** Close parenthesis ()) key. Requires Gecko 15.0 */
        VK_CLOSE_PAREN: 169,
        /* Asterisk (*) key. Requires Gecko 15.0 */
        VK_ASTERISK: 170,
        /** Plus (+) key. Requires Gecko 15.0 */
        VK_PLUS: 171,
        /** Pipe (|) key. Requires Gecko 15.0 */
        VK_PIPE: 172,
        /** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
        VK_HYPHEN_MINUS: 173,
        /** Open curly bracket ({) key. Requires Gecko 15.0 */
        VK_OPEN_CURLY_BRACKET: 174,
        /** Close curly bracket (}) key. Requires Gecko 15.0 */
        VK_CLOSE_CURLY_BRACKET: 175,
        /** Tilde (~) key. Requires Gecko 15.0 */
        VK_TILDE: 176,
        /** Comma (,) key. */
        VK_COMMA: 188,
        /** Period (.) key. */
        VK_PERIOD: 190,
        /** Slash (/) key. */
        VK_SLASH: 191,
        /** Back tick (`) key. */
        VK_BACK_QUOTE: 192,
        /** Open square bracket ([) key. */
        VK_OPEN_BRACKET: 219,
        /** Back slash (\) key. */
        VK_BACK_SLASH: 220,
        /** Close square bracket (]) key. */
        VK_CLOSE_BRACKET: 221,
        /** Quote (''') key. */
        VK_QUOTE: 222,
        /** Meta key on Linux, Command key on Mac. */
        VK_META: 224,
        /** AltGr key on Linux. Requires Gecko 15.0 */
        VK_ALTGR: 225,
        /** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
        VK_WIN: 91,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_KANA: 21,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_HANGUL: 21,
        /** 英数 key on Japanese Mac keyboard. Requires Gecko 15.0 */
        VK_EISU: 22,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_JUNJA: 23,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_FINAL: 24,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_HANJA: 25,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_KANJI: 25,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_CONVERT: 28,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_NONCONVERT: 29,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_ACCEPT: 30,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_MODECHANGE: 31,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_SELECT: 41,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_PRINT: 42,
        /** Linux support for this keycode was added in Gecko 4.0. */
        VK_EXECUTE: 43,
        /** Linux support for this keycode was added in Gecko 4.0.	 */
        VK_SLEEP: 95,
    };
}

export { Constants, Direction, IGridRange, MenuItemId, Point };
