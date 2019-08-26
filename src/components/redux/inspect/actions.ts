import { ACTION_TYPE, Point } from "../../constants";
import { IInspectState } from "./reducer";
import { IBuildingState } from "../building/reducer";

export function inspectClear() {
    return {
        type: ACTION_TYPE.INSPECT_CLEAR,
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectRequestAtPos(xCoord: number, yCoord: number, add: boolean) {
    return {
        type: ACTION_TYPE.INSPECT_TILE_AT_POS,
        val: [xCoord, yCoord],
        add,
    };
}

/** Requests an inspect on a single item given a mouse coordinate */
export function inspectRequestAtMapCoord(coord: Point, add: boolean) {
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
export function inspectRequestRange(first: Point, second: Point, add: boolean) {
    return {
        type: ACTION_TYPE.INSPECT_TILERANGE,
        first,
        second,
        add,
    };
}

export function inspectMoveSelectionRequest(payload: any) {
    return {
        type: ACTION_TYPE.INSPECT_MOVE_SELECTION_REQUEST,
        payload,
    };
}

export function inspectMoveSelectionRequestClear() {
    return {
        type: ACTION_TYPE.INSPECT_MOVE_SELECTION_CLEAR,
    };
}

export function inspectMoveSelectionRequestFinish(
    inspected: IInspectState["inspectedBuildings"],
    list: IBuildingState["buildingList"],
    tiles: IBuildingState["buildingTiles"],
    ids: IBuildingState["buildingIds"],
    bounds: IBuildingState["buildingBounds"],
    ) {
    return {
        type: ACTION_TYPE.INSPECT_MOVE_SELECTION_FINISH,
        inspected,
        list,
        tiles,
        ids,
        bounds,
    };
}
