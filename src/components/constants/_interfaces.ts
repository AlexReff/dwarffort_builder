import { MENU_ITEM } from "./_enums";

export interface IRenderTile {
    x: number;
    y: number;
    char: string | string[];
    color: string | string[];
    bg?: string | string[];
}

export interface ITerrainTile {
    posX: number;
    posY: number;
    posZ: number;
    type: MENU_ITEM;
    characterVariant?: string;
    userSet: boolean;
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
    id: IMenuItem["id"];
    display_name: string;
    hotkey: string;
    submenu: string;
    tiles: IBuildingTileData[][];
    parsedHotkey?: string;
}

export interface IMenuItem {
    id: MENU_ITEM;
    text: string;
    key: string;
    parent: string;
    parsedKey?: string;
}
