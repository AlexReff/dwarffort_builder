const styles = require("../.././css/_variables.scss");

import _ from "lodash";
import { buildings as _buildings } from "../../data/buildings.json";
import { items } from "../../data/menu_flat.json";
import { IBuildingData, IMenuItem } from "./_interfaces";

export type Point = [number, number];

export const DEFAULTS = {
    PAINT_OVERWRITE: true,
    MAP_MIN_W: 48 * 2,
    MAP_MIN_H: 48 * 2,
    CURSOR_CHARACTER: ".",
    COLORS: {
        CURSOR_DEFAULT: "rgba(157,132,19,1)",
        CURSOR_PASSABLE: "rgba(0,255,0,1)",
        CURSOR_IMPASSABLE: "rgba(0,128,0,1)",
        CURSOR_INVALID: "rgba(128,0,0,1)",
        DESIGNATE_START: "rgba(28, 58, 22, .5)",
        DESIGNATE_RANGE: "rgba(72, 36, 12, .3)",
    },
};

export const DEBUG = true;

export const MENU_W: number = Number(styles.menuWidth);
export const HEADER_H: number = Number(styles.headerHeight);

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

export const CONSTRUCTED_WALL_TILES: Point[][] = [
    [[224, 144]],   //no neighbors
    [[224, 144]],   //N
    [[224, 144]],   //E
    [[0, 192]],     //NE
    [[224, 144]],   //S
    [[48, 176]],    //NS
    [[160, 208]],   //SE
    [[160, 208]],   //NES
    [[224, 144]],   //W
    [[144, 208]],   //NW
    [[64, 192]],    //EW
    [[16, 192]],    //NEW
    [[240, 176]],   //SW
    [[64, 176]],    //NSW
    [[32, 192]],    //SEW
    [[224, 144]],   //4-way
];

export const FLOOR_TILES: Point[] = [
    [192, 32],
    [224, 32],
];

export const DEC_TILES: Point[] = [
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

    //wall tiles
    for (const key of Object.keys(CONSTRUCTED_WALL_TILES)) {
        if (CONSTRUCTED_WALL_TILES[key].length > 1) {
            for (let i = 0; i < CONSTRUCTED_WALL_TILES[key].length; i++) {
                val[`wx${key + String.fromCharCode(i + 97)}`] = CONSTRUCTED_WALL_TILES[key][i];
            }
        } else {
            val[`wx${key}`] = CONSTRUCTED_WALL_TILES[key][0];
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
const MENU_JSON = items as IMenuItem[];

export const MENU: {
    ITEMS: {
        [key: string]: IMenuItem;
    },
    KEYS: {
        [key: string]: IMenuItem;
    },
    SUBMENUS: {
        [key: string]: IMenuItem[];
    },
} = {
    ITEMS: _.keyBy(MENU_JSON, "id"),
    KEYS: {},
    SUBMENUS: _.groupBy(MENU_JSON, "parent"),
};

// populate MENU.KEYS and parsedHotkey
for (const key of Object.keys(MENU.ITEMS)) {
    //calculate the 'full' key
    const newKeyParts = [];
    let parent = MENU.ITEMS[key].parent;
    while (parent != null && parent.length > 0 && parent !== "top") {
        newKeyParts.push(MENU.ITEMS[parent].key);
        parent = MENU.ITEMS[parent].parent;
    }
    let newKey = "";
    if (newKeyParts.length > 0) {
        newKey = newKeyParts.reverse().join(":") + ":";
    }
    newKey += MENU.ITEMS[key].key;
    MENU.ITEMS[key].parsedKey = newKey;
    MENU.KEYS[newKey] = MENU.ITEMS[key];
}

const buildings = _buildings as IBuildingData[];

export const BUILDINGS: {
    /** Keys == 'id' */
    ITEMS: { [key: string]: IBuildingData },
    /** Keys == 'hotkey:path:full' */
    KEYS: {
        [key: string]: IBuildingData;
    },
    /** Keys == submenu ids */
    SUBMENUS: {
        [key: string]: IBuildingData[];
    },
} = {
    ITEMS: _.keyBy(buildings, "id"),
    KEYS: {},
    SUBMENUS: _.groupBy(buildings, "parent"),
};

// populate buildings parsedHotkey
for (const target of buildings) {
    if (!(target.submenu in MENU.ITEMS)) {
        continue; //invalid 'submenu' value
    }
    target.parsedHotkey = MENU.ITEMS[target.submenu].parsedKey + ":" + target.hotkey;
    BUILDINGS.KEYS[target.parsedHotkey] = target;
    if (!(target.submenu in BUILDINGS.SUBMENUS)) {
        BUILDINGS.SUBMENUS[target.submenu] = [];
    }
    BUILDINGS.SUBMENUS[target.submenu].push(target);
}

// add submenu keys for submenus with only buildings
for (const key of Object.keys(BUILDINGS.SUBMENUS)) {
    if (!(key in MENU.SUBMENUS)) {
        MENU.SUBMENUS[key] = null;
    }
}

export const SUBMENU_MAX_H: number = Object.keys(MENU.SUBMENUS).reduce((map, key) => {
    let length = 0;
    if (key in MENU.SUBMENUS && MENU.SUBMENUS[key] != null) {
        length += MENU.SUBMENUS[key].length;
    }
    if (key in BUILDINGS.SUBMENUS && BUILDINGS.SUBMENUS[key] != null) {
        length += BUILDINGS.SUBMENUS[key].length;
    }
    map = Math.max(map, length);
    return map;
}, -1);
