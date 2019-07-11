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
    static readonly GRID_TILE_DECORATED_COLORS: string[] = [
        // "rgba(0,255,255,1)", //LCYAN
        // "rgba(0,255,0,1)", //GREEN
        // "rgba(255,255,0,1)", //YELLOW
        // "rgba(255,255,255,.1)", //WHITE
        "rgba(255,255,255,.1)", //grey-ish
        "rgba(255,255,0,.5)", //natural-er yellow
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
        // return {
        //     " ": [0, 0],        //empty
        //     "@": [16, 0],       //player?
        //     ".": [128, 112],    //cursor
        //     "z0": [192, 16],    //decorated empty //3 spades
        //     "z1": [32, 128],    //decorated empty //3-dot ore
        //     "z2": [192, 144],   //decorated empty //3-dot ore - do not color
        //     "z3": [176, 160],  //decorated empty //3-dot ore - do not color
        //     "z4": [208, 16],    //decorated empty //large spade
        //     "z5": [160, 32],    //decorated empty //large single ore
        //     "z6": [176, 128],   //decorated empty //large symmetrical gem/ore - do not color
        //     "z7": [144, 160],  //decorated empty //medium ore - do not color
        //     "z8": [160, 160],  //decorated empty //2 medium ore - do not color
        // };
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
