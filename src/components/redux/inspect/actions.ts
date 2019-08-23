import { ACTION_TYPE, IInspectTarget, Point } from "../../constants";

/** nulls out the inspect request */
export function inspectTileClear() {
    return {
        type: ACTION_TYPE.INSPECT_TILE_CLEAR,
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectTileAtPos(xCoord: number, yCoord: number) {
    return {
        type: ACTION_TYPE.INSPECT_TILE_AT_POS,
        val: [xCoord, yCoord],
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectTileAtMapCoord(coord: Point) {
    return {
        type: ACTION_TYPE.INSPECT_TILE_AT_MAPCOORD,
        coord,
    };
}

/** Populates the inspected building array */
export function inspectTiles(tiles: IInspectTarget[]) {
    return {
        type: ACTION_TYPE.INSPECT_TILES,
        val: tiles,
    };
}

/** Request to inspect a range of buildings given mouse bounds */
export function inspectTileRange(first: Point, second: Point) {
    return {
        type: ACTION_TYPE.INSPECT_TILERANGE,
        first,
        second,
    };
}
