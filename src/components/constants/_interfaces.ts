import { IMenuItem, MENU_ID } from ".";

export interface IMenuItem {
    key: string;
    text: string;
    parent: MENU_ID;
    id?: MENU_ID;
    parsedKey?: string;
    tiles?: IBuildingTileData[][];
}

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
    type: IMenuItem["id"];
    characterVariant?: string;
    userSet: boolean;
}

export interface IBuildingTileData {
    char?: string;
    bg?: string;
    fg?: string;
    walkable?: number;
}
