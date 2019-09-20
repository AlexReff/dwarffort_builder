import { MENU_ITEM } from "./_enums";

export interface IRenderTile {
    x: number;
    y: number;
    char: string;
    color: string;
}

export interface IBuildingTileData {
    char: string;
    bg: string;
    fg: string;
    walkable: number;
}

export interface IBuildingData {
    "id": "top" | MENU_ITEM;
    "display_name": string;
    "hotkey": string;
    "submenu": string;
    "tiles": IBuildingTileData[][];
    "parsedHotkey"?: string;
}

export interface IGridRange {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

export interface IFlatMenuItem {
    "id": MENU_ITEM;
    "text": string;
    "key": string;
    "parent": string;
    "parsedKey"?: string;
}

export interface IMenuItem {
    "text"?: string;
    "key"?: string;
    "id": "top" | MENU_ITEM;
    "children"?: IMenuItem[];
    "parent"?: IMenuItem;
}
