const styles = require(".././css/_variables.scss");

import * as buildings from "../data/buildings.json";
import * as items from "../data/menu.json";
import { IMenuItem } from "./menu.js";

import { CURSOR_BEHAVIOR, DIRECTION, KEYS, MENU_ITEM } from "./enums";
export { DIRECTION, KEYS, MENU_ITEM };

export interface IBuildingData {
    char: string;
    bg: string;
    fg: string;
    walkable: number;
}

export interface IGridRange {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

export type Point = [number, number];

export const DEFAULTS = {
    STRICT_MODE: true,
    PAINT_OVERWRITE: true,
    MAP_MIN_W: 48 * 2,
    MAP_MIN_H: 48 * 2,
    CURSOR_MODE: CURSOR_BEHAVIOR.MODERN,
    COLORS: {
        CURSOR_DEFAULT: "rgba(157,132,19,1)",
        CURSOR_PASSABLE: "rgba(0,255,0,1)",
        CURSOR_IMPASSABLE: "rgba(0,128,0,1)",
        CURSOR_INVALID: "rgba(128,0,0,1)",
    },
};

export const DEBUG = true;

export const MENU_W: number = Number(styles.menuWidth);
export const HEADER_H: number = Number(styles.headerHeight);

// Building Data
export const BUILDINGS: { [key: string]: { "tiles": IBuildingData[][] } } = buildings as any;

// Tile Data
export const TILE_W = styles.tileWidth;
export const TILE_H = styles.tileHeight;
export const TILE_URL = "/assets/Phoebus_cleaned.png";

export const WALL_TILES: Point[][] = [
    [[112, 192]], //0000 'edge'   //0
    [[112, 192]], //0001 N 'edge' //1
    [[112, 192]], //0010 E 'edge' //2
    [             //0011 NE       //3
        [48, 208],
        [64, 208],
        [128, 192],
    ],
    [[112, 192]], //0100 S 'edge' //4
    [[160, 176]], //0101 NS       //5
    [             //0110 SE       //6
        [80, 208],
        [96, 208],
        [144, 192],
    ],
    [[192, 192]], //0111 NES      //7
    [[112, 192]], //1000 W 'edge' //8
    [             //1001 NW       //9
        [192, 176],
        [208, 176],
        [224, 176],
    ],
    [[208, 192]], //1010 EW       //10
    [[160, 192]], //1011 NEW      //11
    [             //1100 SW       //12
        [112, 176],
        [128, 176],
        [176, 176],
    ],
    [[144, 176]], //1101 NSW      //13
    [[176, 192]], //1110 SEW      //14
    [[224, 192]], //1111 4-way    //15
];

export const FLOOR_TILES: Point[] = [
    [192, 32],
    [224, 32],
    // [0, 96],
    // [0, 176],
    // [16, 176],
    // [32, 176],
];

export const DEC_TILES: Array<[number, number]> = [
    [192, 16], // 3 spades
    [32, 128], // 3 ore
    [192, 144], // 3 ore
    [176, 160], // 3 ore
    [208, 16], // large spade
    [160, 32], // large single ore
    [176, 128], // large symmetrical ore
    [144, 160], // medium ore
    [160, 160], // 2 ore
];

export const DEC_TILES_COLORS: string[] = [
    "rgba(0,255,255,.4)", //LCYAN
    "rgba(0,255,0,.4)", //GREEN
    // "rgba(255,255,0,1)", //YELLOW
    // "rgba(255,255,255,.1)", //WHITE
    "rgba(255,255,255,.1)", //grey-ish
    "rgba(255,255,0,.4)", //natural-er yellow
];

export const TILE_MAP: { [key: string]: Point; } = ((): { [key: string]: Point; } => {
    let val: { [key: string]: Point; } = {};
    val = {
        " ": [0, 0],        //empty
        "@": [16, 0],       //player?
        ".": [128, 80],     //cursor
        ",": [176, 32],     //designation
    };

    //decorator tiles
    for (let i = 0; i < DEC_TILES.length; i++) {
        val[`z${i}`] = DEC_TILES[i];
    }

    //wall tiles
    for (const key of Object.keys(WALL_TILES)) {
        if (WALL_TILES[key].length > 1) {
            for (let i = 0; i < WALL_TILES[key].length; i++) {
                val[`w${key + String.fromCharCode(i + 97)}`] = WALL_TILES[key][i];
            }
        } else {
            val[`w${key}`] = WALL_TILES[key][0];
        }
    }

    //floor tiles
    for (let i = 0; i < FLOOR_TILES.length; i++) {
        val[`f${i}`] = FLOOR_TILES[i];
    }

    //reference by # directly for buildings
    let count = 0;
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            val[`i${count++}`] = [x * TILE_W, y * TILE_H];
        }
    }

    return val;
})();

// Menu Data
export const MENU_ITEMS = items.items as IMenuItem[];

export const SUBMENUS: Map<string, string> = new Map();
export const MENU_IDS: Map<string, IMenuItem> = new Map();

let _tallestMenu = -1;

export const MENU_KEYS: Map<string, IMenuItem> = (() => {
    const result: Map<string, IMenuItem> = new Map();
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
            result[key] = item;
            MENU_IDS[item.id] = item;
            if (item.children != null && item.children.length) {
                SUBMENUS[item.id] = key;
                _tallestMenu = Math.max(_tallestMenu, item.children.length);
                parseMenuItemRecursive(item.children, item);
            }
        }
    };

    parseMenuItemRecursive(MENU_ITEMS);

    return result;
})();

export const SUBMENU_MAX_H = _tallestMenu;
