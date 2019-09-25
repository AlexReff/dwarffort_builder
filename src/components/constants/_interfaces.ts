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
    "id": IMenuItem["id"];
    "text": IMenuItem["text"];
    "key": IMenuItem["key"];
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
