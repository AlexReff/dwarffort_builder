import { BUILDINGS, MENU } from "../../constants";
import { getMapCoord } from "../../util";
import { ACTION_TYPE, FlatGetState } from "../store";
import { IInspectState } from "./reducer";

//#region REDUX ACTIONS

export function setInspectBuildings(items: string[]) {
    return {
        type: ACTION_TYPE.SET_INSPECT_BUILDINGS,
        items,
    };
}

export function addInspectBuilding(item: string) {
    return {
        type: ACTION_TYPE.ADD_INSPECT_BUILDING,
        item,
    };
}

export function removeInspectBuilding(item: string) {
    return {
        type: ACTION_TYPE.REMOVE_INSPECT_BUILDING,
        item,
    };
}

//#endregion
//#region THUNK ACTIONS

export function toggleInspectBuilding(item: string) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (state.inspectedBuildings.some((e) => e === item)) {
            dispatch(removeInspectBuilding(item));
        } else {
            dispatch(addInspectBuilding(item));
        }
    };
}

export function inspectGridPos(x: number, y: number, add?: boolean) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        const [mapX, mapY] = getMapCoord(x, y, state);
        const key = `${mapX}:${mapY}`;
        if (state.cameraZ in state.buildingPositions) {
            if (key in state.buildingPositions[state.cameraZ]) {
                const idKey = state.buildingPositions[state.cameraZ][key];
                if (idKey in state.buildingTiles[state.cameraZ]) {
                    if (add) {
                        dispatch(toggleInspectBuilding(idKey));
                    } else {
                        dispatch(setInspectBuildings([idKey]));
                    }
                }
            }
        }
    };
}

//#endregion
