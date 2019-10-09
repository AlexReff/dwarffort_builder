import { BUILDING_DATA, MENU_DATA, MENU_KEYS } from ".";
import { IMenuItem, MENU_ID } from "..";
import { buildings as _buildings } from "../../../data/buildings.json";
import { BUILDING_KEYS } from "./_data";

// Menu Data

export const MENU: {
    ITEMS: Record<MENU_KEYS, IMenuItem>,
    KEYS: Record<string, IMenuItem>,
    SUBMENUS: Record<MENU_ID, IMenuItem[]>,
} = {
    ITEMS: MENU_DATA,
    KEYS: {},
    SUBMENUS: Object.keys(MENU_DATA).reduce((obj, val) => {
        if (MENU_DATA[val].parent in obj) {
            obj[MENU_DATA[val].parent].push(MENU_DATA[val]);
        } else {
            obj[MENU_DATA[val].parent] = [MENU_DATA[val]];
        }
        return obj;
    }, {} as Record<MENU_ID, IMenuItem[]>),
};

// populate MENU.KEYS and parsedHotkey
for (const key of Object.keys(MENU.ITEMS)) {
    //calculate the 'full' key
    const newKeyParts = [];
    let parent = MENU.ITEMS[key].parent;
    while (parent != null && parent.length > 0 && parent !== MENU_ID.top) {
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

export const BUILDINGS: {
    /** Keys == 'id' */
    ITEMS: Record<BUILDING_KEYS, IMenuItem>,
    /** Keys == 'hotkey:path:full' */
    KEYS: Record<string, IMenuItem>,
    /** Keys == submenu ids */
    SUBMENUS: Record<BUILDING_KEYS, IMenuItem[]>,
} = {
    ITEMS: BUILDING_DATA as Record<BUILDING_KEYS, IMenuItem>,
    KEYS: {},
    SUBMENUS: Object.keys(BUILDING_DATA).reduce((obj, val) => {
        if (BUILDING_DATA[val].parent in obj) {
            obj[BUILDING_DATA[val].parent].push(BUILDING_DATA[val]);
        } else {
            obj[BUILDING_DATA[val].parent] = [BUILDING_DATA[val]];
        }
        return obj;
    }, {} as Record<BUILDING_KEYS, IMenuItem[]>),
};

// add submenu keys for submenus with only buildings
for (const key of Object.keys(BUILDINGS.SUBMENUS)) {
    if (!(key in MENU.SUBMENUS)) {
        MENU.SUBMENUS[key] = null;
    }
}

// populate buildings parsedHotkey
for (const target of Object.values(BUILDINGS.ITEMS)) {
    if (!(target.parent in MENU.ITEMS)) {
        continue; //invalid 'submenu' value
    }
    target.parsedKey = MENU.ITEMS[target.parent].parsedKey + ":" + target.key;
    BUILDINGS.KEYS[target.parsedKey] = target;
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
