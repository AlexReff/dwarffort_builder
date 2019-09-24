import produce from "immer";
import { BUILDINGS } from "../../constants";
import { isBuildingPlaceable } from "../../util";
import { ACTION_TYPE, FlatGetState } from "../store";
import { IBuildingState } from "./reducer";

//#region REDUX ACTIONS

export function setBuildings(tiles: IBuildingState["buildingTiles"], positions: IBuildingState["buildingPositions"]) {
    return {
        type: ACTION_TYPE.SET_BUILDINGS,
        tiles,
        positions,
    };
}

//#endregion
//#region THUNK ACTIONS

export function placeCursorBuilding(_x?: number, _y?: number) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (!(state.currentMenuItem in BUILDINGS.IDS)) {
            return;
        }
        const positions = state.buildingPositions;
        const targetX = _x || state.cursorX;
        const targetY = _y || state.cursorY;
        if (!(state.cameraZ in positions)) {
            positions[state.cameraZ] = {};
        }
        const tiles = produce(state.buildingTiles, (draft) => {
            const range = state.cursorRadius;
            const startX = targetX - range;
            const startY = targetY - range;
            const endX = targetX + range;
            const endY = targetY + range;
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (!isBuildingPlaceable(state, x, y)) {
                        return;
                    }
                    positions[state.cameraZ][`${x}:${y}`] = `${targetX}:${targetY}`;
                }
            }
            if (!(state.cameraZ in draft)) {
                draft[state.cameraZ] = {};
            }
            const key = `${targetX}:${targetY}`;
            if (key in draft[state.cameraZ]) {
                return;
            }
            draft[state.cameraZ][key] = {
                posX: targetX,
                posY: targetY,
                posZ: state.cameraZ,
                key: state.currentMenuItem,
            };
        });
        if (!(state.cameraZ in tiles) || //no z-level in the result, so no buildings can exist
            (state.cameraZ in state.buildingTiles && //no new items
            Object.keys(state.buildingTiles[state.cameraZ]).length === Object.keys(tiles[state.cameraZ]).length)) {
            return;
        }
        dispatch(setBuildings(tiles, positions));
    };
}

//#endregion
