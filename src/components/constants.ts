const styles = require(".././css/_variables.scss");

import * as buildings from "../data/buildings.json";
import { items } from "../data/menu.json";
import { IMenuItem } from "./menu.js";

import { Direction, KEYS, MenuItemId } from "./enums";
export { Direction, KEYS, MenuItemId };

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

export const DEBUG_MODE_ENABLED = true;

export const TILE_WIDTH = styles.tileWidth;
export const TILE_HEIGHT = styles.tileHeight;
export const TILESHEET_URL = "/assets/Phoebus_cleaned.png"; // "/assets/Phoebus_16x16.png";

export const MENU_WIDTH_INITIAL: number = Number(styles.menuWidth);
export const HEADER_HEIGHT_INITIAL: number = Number(styles.headerHeight);

export const GRID_TILE_COLOR_PERCENT: number = 50; // #/100 likelihood of a decorated tile to be colored
export const GRID_TILE_DECORATED_PERCENT: number = 15; // #/100 likelihood of an empty tile to be decorated
export const GRID_TILE_DECORATED_COLORS: string[] = [
    "rgba(0,255,255,.4)", //LCYAN
    "rgba(0,255,0,.4)", //GREEN
    // "rgba(255,255,0,1)", //YELLOW
    // "rgba(255,255,255,.1)", //WHITE
    "rgba(255,255,255,.1)", //grey-ish
    "rgba(255,255,0,.4)", //natural-er yellow
];

export const CURSOR_COLOR = "rgba(157,132,19,1)";
export const CURSOR_PASSABLE_COLOR = "rgba(0,255,0,1)";
export const CURSOR_IMPASSABLE_COLOR = "rgba(0,128,0,1)";
export const CURSOR_INVALID_COLOR = "rgba(128,0,0,1)";

export const BUILDING_TILE_MAP: { [key: string]: { "tiles": IBuildingData[][] } } = buildings as any;

export const WALL_TILES: Point[][] = [
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

export const FLOOR_TILES: Point[] = [
    [192, 32],
    [224, 32],
    // [0, 96],
    // [0, 176],
    // [16, 176],
    // [32, 176],
];

export const DECORATOR_TILES: Array<{
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

export const TILE_MAP: { [key: string]: Point; } = ((): { [key: string]: Point; } => {
    let val: { [key: string]: Point; } = {};
    val = {
        " ": [0, 0],        //empty
        "@": [16, 0],       //player?
        ".": [128, 80],     //cursor
        ",": [176, 32],     //designation
    };

    //decorator tiles `z${number}`
    DECORATOR_TILES.forEach((tile) => {
        val[tile.char] = tile.coord;
    });

    //wall tiles `w${number}${optional variant letter (a,b,c,etc)}`
    for (const key of Object.keys(WALL_TILES)) {
        if (WALL_TILES[key].length > 1) {
            for (let i = 0; i < WALL_TILES[key].length; i++) {
                val["w" + key + String.fromCharCode(i + 97)] = WALL_TILES[key][i];
            }
        } else {
            val["w" + key] = WALL_TILES[key][0];
        }
    }

    //floor tiles `f${number}`
    for (let i = 0; i < FLOOR_TILES.length; i++) {
        val["f" + i] = FLOOR_TILES[i];
    }

    //reference by # directly
    let count = 0;
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            val["i" + count++] = [x * TILE_WIDTH, y * TILE_HEIGHT];
        }
    }

    return val;
})();

export const MENU_ITEMS = items as IMenuItem[];

export const MENU_SUBMENUS: Map<string, string> = new Map();

export const MENU_HOTKEYS: Map<string, IMenuItem> = (() => {
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
                MENU_SUBMENUS[item.id] = key;
                parseMenuItemRecursive(item.children, item);
            }
        }
    };

    parseMenuItemRecursive(MENU_ITEMS);

    return MENU_PARSED;
})();

export const MENU_DICTIONARY: Map<string, IMenuItem> = (() => {
    const result: Map<string, IMenuItem> = new Map();
    for (const i of Object.keys(MENU_HOTKEYS)) {
        result[(MENU_HOTKEYS[i] as IMenuItem).id] = MENU_HOTKEYS[i];
    }
    return result;
})();
