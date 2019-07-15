const styles = require(".././css/_variables.scss");

import { items } from "../data/menu.json";
import { Direction } from "./enums";
import { IMenuItem } from "./menu.js";

export { Direction };

export class Constants {
    static readonly DEBUG_MODE_ENABLED = true;

    static readonly TILE_WIDTH = 16;
    static readonly TILE_HEIGHT = 16;
    static readonly TILESHEET_URL = "/assets/Phoebus_cleaned.png"; // "/assets/Phoebus_16x16.png";

    static readonly MENU_WIDTH_INITIAL: number = Number(styles.menuWidth);
    static readonly HEADER_HEIGHT_INITIAL: number = Number(styles.headerHeight);

    static readonly GRID_TILE_COLOR_PERCENT: number = 40; // #/100 likelihood of a decorated tile to be colored
    static readonly GRID_TILE_DECORATED_PERCENT: number = 15; // #/100 likelihood of an empty tile to be decorated
    static readonly GRID_TILE_DECORATED_COLORS: string[] = [
        "rgba(0,255,255,.4)", //LCYAN
        "rgba(0,255,0,.4)", //GREEN
        // "rgba(255,255,0,1)", //YELLOW
        // "rgba(255,255,255,.1)", //WHITE
        "rgba(255,255,255,.1)", //grey-ish
        "rgba(255,255,0,.4)", //natural-er yellow
    ];

    static readonly WALL_TILES: Array<{[key: number]: Array<[number, number]>}> = [
        {0: [[192, 112]]}, //0000 'edge'
        {1: [[192, 112]]}, //0001 N 'edge'
        {2: [[192, 112]]}, //0010 E 'edge'
        {4: [[192, 112]]}, //0100 S 'edge'
        {8: [[192, 112]]}, //1000 W 'edge'
        {3: [[208, 48],
             [208, 64],
             [192, 128]]}, //0011 NE
        {5: [[176, 160]]}, //0101 NS
        {6: [[208, 80],
             [208, 96],
             [192, 144]]}, //0110 SE
        {7: [[192, 192]]}, //0111 NES
        {9: [[176, 192],
             [176, 208],
             [176, 224]]}, //1001 NW
        {10: [[192, 208]]}, //1010 EW
        {11: [[192, 160]]}, //1011 NEW
        {12: [[176, 112],
              [176, 128],
              [176, 176]]}, //1100 SW
        {13: [[176, 144]]}, //1101 NSW
        {14: [[192, 176]]}, //1110 SEW
        {15: [[192, 224]]}, //1111 4-way
    ];

    static readonly DECORATOR_TILES: Array<{
        char: string,
        desc: string,
        coord: [number, number],
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

    static readonly TILE_MAP: { [key: string]: [number, number]; } = ((): { [key: string]: [number, number]; } => {
        let val: { [key: string]: [number, number]; } = {};
        val = {
            " ": [0, 0],        //empty
            "@": [16, 0],       //player?
            ".": [128, 112],    //cursor
        };
        Constants.DECORATOR_TILES.forEach((tile) => {
            val[tile.char] = tile.coord;
        });
        return val;
    })();

    static readonly MENU_ITEMS = items as IMenuItem[];

    static readonly MENU_SUBMENUS: Map<string, string> = new Map();

    static readonly MENU_DICTIONARY: Map<string, IMenuItem> = (() => {
        const MENU_PARSED: Map<string, IMenuItem> = new Map();
        const parseMenuItemRecursive = (menuItems: IMenuItem[], parent?: IMenuItem) => {
            for (const item of menuItems) {
                item.parent = parent;
                const key = (parent != null ? parent.key + ":" : "") + item.key;
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
}
