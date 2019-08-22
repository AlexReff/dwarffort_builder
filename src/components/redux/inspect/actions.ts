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

/** Populates the inspected building array */
export function inspectTiles(tiles: IInspectTarget[]) {
    return {
        type: ACTION_TYPE.INSPECT_TILES,
        val: tiles,
    };
}

/** Request to inspect a range of buildings given mouse bounds */
export function inspectTileRange(xStart: number, xEnd: number, yStart: number, yEnd: number) {
    return (dispatch, getState) => {
        //
    };
}
