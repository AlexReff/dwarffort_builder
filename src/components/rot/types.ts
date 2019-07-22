type LayoutType = "hex" | "rect" | "tile" | "tile-gl" | "term";

export interface IDisplayOptions {
    width: number;
    height: number;
    transpose: boolean;
    layout: LayoutType;
    fontSize: number;
    spacing: number;
    border: number;
    forceSquareRatio: boolean;
    fontFamily: string;
    fontStyle: string;
    fg: string;
    bg: string;
    tileWidth: number;
    tileHeight: number;
    tileMap: { [key: string]: [number, number] };
    tileSet: null | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap;
    tileColorize: boolean;
}

export type DisplayData = [number, number, string | string[] | null, string, string];
