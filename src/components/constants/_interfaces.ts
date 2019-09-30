import { MENU_ITEM } from "./_enums";

export interface IRenderTile {
    x: number;
    y: number;
    char: string | string[];
    color: string | string[];
    bg?: string | string[];
}

export interface IBuildingTileData {
    char: string;
    bg: string;
    fg: string;
    walkable: number;
}

/** First key is cameraZ, second is `${x}:${y}` */
export interface ITileCollection<T> {
    [key: string]: { [key: string]: T };
}

export interface IBuildingData {
    "id": MENU_ITEM;
    "display_name": string;
    "hotkey": string;
    "submenu": string;
    "tiles": IBuildingTileData[][];
    "parsedHotkey"?: string;
}

export interface IMenuItem {
    "id": "top" | MENU_ITEM;
    "text": string;
    "key": string;
    "parent": string;
    "parsedKey"?: string;
}
