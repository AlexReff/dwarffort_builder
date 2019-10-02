import produce from "immer";
import { BUILDINGS, MENU_ITEM } from "../../constants";
import { getWallNeighborFlags, isBuildingPlaceable, updateWallNeighbors } from "../../util";
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
        if (!(state.currentMenuItem in BUILDINGS.ITEMS)) {
            return;
        }

        const targetX = _x || state.cursorX;
        const targetY = _y || state.cursorY;
        const range = state.cursorRadius;
        const startX = targetX - range;
        const startY = targetY - range;
        const endX = targetX + range;
        const endY = targetY + range;
        const centerKey = `${targetX}:${targetY}`;

        let newPositions = {};
        if (state.cameraZ in state.buildingPositions) {
            newPositions = { ...state.buildingPositions[state.cameraZ] };
        }

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (!isBuildingPlaceable(state, x, y)) {
                    return;
                }
                newPositions[`${x}:${y}`] = centerKey;
            }
        }

        const tiles = produce(state.buildingTiles, (draft) => {
            if (!(state.cameraZ in draft)) {
                draft[state.cameraZ] = {};
            }
            draft[state.cameraZ][centerKey] = {
                posX: targetX,
                posY: targetY,
                posZ: state.cameraZ,
                key: state.currentMenuItem,
            };
            updateWallNeighbors(state, draft);
        });

        if (!(state.cameraZ in tiles) || //no z-level in the result, so no buildings can exist
            (state.cameraZ in state.buildingTiles && //no new items
                Object.keys(state.buildingTiles[state.cameraZ]).length === Object.keys(tiles[state.cameraZ]).length)) {
            return;
        }

        const positions = {
            ...state.buildingPositions,
            [state.cameraZ]: newPositions,
        };

        dispatch(setBuildings(tiles, positions));
    };
}

//#endregion
