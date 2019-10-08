import produce from "immer";
import { BUILDINGS } from "../../constants";
import { isBuildingPlaceable, updateWallNeighbors } from "../../util";
import { IInspectState } from "../inspect/reducer";
import { ACTION_TYPE, ReduxState } from "../store";
import { IBuildingState } from "./reducer";

//#region REDUX ACTIONS

export function setBuildings(
    buildingTiles: IBuildingState["buildingTiles"],
    buildingPositions: IBuildingState["buildingPositions"],
    inspectedBuildings: IInspectState["inspectedBuildings"],
    ) {
    return {
        type: ACTION_TYPE.SET_BUILDINGS,
        buildingTiles,
        buildingPositions,
        inspectedBuildings,
    };
}

export function deleteBuildings(cameraZ: number, targets: string[]) {
    return {
        type: ACTION_TYPE.DELETE_BUILDINGS,
        cameraZ,
        targets,
    };
}

export function increasePlaceBuildWidth(count: number = 1) {
    return {
        type: ACTION_TYPE.PLACEBUILD_WIDTH_INCREASE,
        count,
    };
}

export function increasePlaceBuildHeight(count: number = 1) {
    return {
        type: ACTION_TYPE.PLACEBUILD_HEIGHT_INCREASE,
        count,
    };
}

export function decreasePlaceBuildWidth(count: number = 1) {
    return {
        type: ACTION_TYPE.PLACEBUILD_WIDTH_DECREASE,
        count,
    };
}

export function decreasePlaceBuildHeight(count: number = 1) {
    return {
        type: ACTION_TYPE.PLACEBUILD_HEIGHT_DECREASE,
        count,
    };
}

//#endregion
//#region THUNK ACTIONS

export function placeCursorBuilding(mapX?: number, mapY?: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        if (!(state.menu.currentMenuItem in BUILDINGS.ITEMS)) {
            return;
        }

        const buildingTiles = state.building.buildingTiles;
        const buildingPositions = state.building.buildingPositions;
        const cameraZ = state.camera.cameraZ;
        const radius = state.cursor.cursorRadius;
        const buildingSize = 1 + (radius * 2);
        const targetX = mapX || state.cursor.cursorX;
        const targetY = mapY || state.cursor.cursorY;
        const startX = targetX - radius;
        const startY = targetY - radius;
        const endX = targetX + radius + (buildingSize * (state.building.buildPlaceWidth - 1));
        const endY = targetY + radius + (buildingSize * (state.building.buildPlaceHeight - 1));

        let newPositions = {};
        if (cameraZ in buildingPositions) {
            newPositions = { ...buildingPositions[cameraZ] };
        }

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (!isBuildingPlaceable(state, x, y)) {
                    return;
                }
                //find the center key
                const instX = Math.floor((x - startX) / buildingSize);
                const instY = Math.floor((y - startY) / buildingSize);
                const centerX = startX + (instX * buildingSize) + radius;
                const centerY = startY + (instY * buildingSize) + radius;
                const centerKey = `${centerX}:${centerY}`;
                newPositions[`${x}:${y}`] = centerKey;
            }
        }

        const tiles = produce(buildingTiles, (draft) => {
            if (!(cameraZ in draft)) {
                draft[cameraZ] = {};
            }
            for (let x = 0; x < state.building.buildPlaceWidth; x++) {
                for (let y = 0; y < state.building.buildPlaceHeight; y++) {
                    const centerX = startX + (x * buildingSize) + radius;
                    const centerY = startY + (y * buildingSize) + radius;
                    const centerKey = `${centerX}:${centerY}`;
                    draft[cameraZ][centerKey] = {
                        posX: centerX,
                        posY: centerY,
                        posZ: cameraZ,
                        key: state.menu.currentMenuItem,
                    };
                }
            }
            updateWallNeighbors(state, draft);
        });

        if (!(cameraZ in tiles) || //no z-level in the result, so no buildings can exist
            (cameraZ in buildingTiles && //no new items
                Object.keys(buildingTiles[cameraZ]).length
                === Object.keys(tiles[cameraZ]).length)) {
            return;
        }

        const positions = {
            ...buildingPositions,
            [cameraZ]: newPositions,
        };

        dispatch(setBuildings(tiles, positions, []));
    };
}

//#endregion
