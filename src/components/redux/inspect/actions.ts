import { ACTION_TYPE, Point } from "../../constants";

export function inspectClear() {
    return {
        type: ACTION_TYPE.INSPECT_CLEAR,
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectTileAtPos(xCoord: number, yCoord: number, add: boolean) {
    return {
        type: ACTION_TYPE.INSPECT_TILE_AT_POS,
        val: [xCoord, yCoord],
        add,
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectTileAtMapCoord(coord: Point, add: boolean) {
    return {
        type: ACTION_TYPE.INSPECT_TILE_AT_MAPCOORD,
        coord,
        add,
    };
}

/** Populates the inspected building array */
export function inspectTiles(tiles: string[]) {
    return {
        type: ACTION_TYPE.INSPECT_TILES,
        val: tiles,
    };
}

/** Request to inspect a range of buildings given mouse bounds */
export function inspectTileRange(first: Point, second: Point, add: boolean) {
    return {
        type: ACTION_TYPE.INSPECT_TILERANGE,
        first,
        second,
        add,
    };
}
