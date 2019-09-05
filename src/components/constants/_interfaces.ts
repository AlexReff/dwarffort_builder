import { MENU_ITEM } from "./_enums";

export interface IBuildingTileData {
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

export interface IFlatMenuItem {
    "id": string;
    "text": string;
    "key": string;
    "parent": string;
    "parsedKey"?: string;
}

export interface IMenuItem {
    "text"?: string;
    "key"?: string;
    "id": MENU_ITEM;
    "children"?: IMenuItem[];
    "parent"?: IMenuItem;
}
