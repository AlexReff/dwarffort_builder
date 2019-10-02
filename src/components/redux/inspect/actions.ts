import produce from "immer";
import { MENU_ITEM, Point, TILE_H, TILE_W } from "../../constants";
import { getMapCoord, getWallNeighborFlags, updateWallNeighbors } from "../../util";
import { ACTION_TYPE, FlatGetState } from "../store";

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

export function _moveInspectedBuildings(buildingTiles, buildingPositions, inspectedBuildings) {
    return {
        type: ACTION_TYPE.MOVE_INSPECT_BUILDINGS,
        buildingTiles,
        buildingPositions,
        inspectedBuildings,
    };
}

//#endregion
//#region THUNK ACTIONS

export function inspectGridRange(gridA: Point, gridB: Point, add: boolean = false) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (state.buildingPositions == null ||
            !(state.cameraZ in state.buildingPositions) ||
            Object.keys(state.buildingPositions[state.cameraZ]).length === 0) {
            return;
        }

        const mapA = getMapCoord(gridA[0], gridA[1], state);
        const mapB = getMapCoord(gridB[0], gridB[1], state);

        const minX = Math.min(mapA[0], mapB[0]);
        const minY = Math.min(mapA[1], mapB[1]);
        const maxX = Math.max(mapA[0], mapB[0]);
        const maxY = Math.max(mapA[1], mapB[1]);

        const bldgKeys = new Set<string>();

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const key = `${x}:${y}`;
                if (key in state.buildingPositions[state.cameraZ]) {
                    bldgKeys.add(state.buildingPositions[state.cameraZ][key]);
                }
            }
        }

        const bldgVals = Array.from(bldgKeys.values());

        const inspectedBuildings = add ? state.inspectedBuildings.concat(bldgVals.filter((m) => !state.inspectedBuildings.some((n) => n === m))) : bldgVals;

        dispatch(setInspectBuildings(inspectedBuildings));
    };
}

export function moveInspectedBuildings(diffX: number, diffY: number) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);

        if (!(state.cameraZ in state.terrainTiles) ||
            !(state.cameraZ in state.buildingTiles)) {
            return;
        }

        const xGridDiff = Math.floor(diffX / +TILE_W);
        const yGridDiff = Math.floor(diffY / +TILE_H);

        const allNewPositions = [];
        //validate no building is in the way
        for (const bldgKey of state.inspectedBuildings) {
            const bldgPositions = Object.keys(state.buildingPositions[state.cameraZ]).filter((m) => state.buildingPositions[state.cameraZ][m] === bldgKey);
            for (const pos of bldgPositions) {
                const parts = pos.split(":");
                const newPos = `${+parts[0] + xGridDiff}:${+parts[1] + yGridDiff}`;
                allNewPositions.push(newPos);
                if (newPos in state.buildingPositions[state.cameraZ]) {
                    if (!state.inspectedBuildings.some((e) => e === state.buildingPositions[state.cameraZ][newPos])) {
                        return; //non-inspected building found at new position
                    }
                }
            }
        }
        //validate terrain
        for (const pos of allNewPositions) {
            if (!(pos in state.terrainTiles[state.cameraZ])) {
                return; //no floor
            }
            if (state.terrainTiles[state.cameraZ][pos].type !== MENU_ITEM.mine) {
                return; //non-floor detected
            }
        }
        const buildingTiles = produce(state.buildingTiles, (draft) => {
            const newThings = {};
            for (const key of Object.keys(draft[state.cameraZ])) {
                if (state.inspectedBuildings.some((m) => m === key)) {
                    const plucked = draft[state.cameraZ][key];
                    delete draft[state.cameraZ][key];
                    plucked.posX += xGridDiff;
                    plucked.posY += yGridDiff;
                    const keyParts = key.split(":");
                    const newKey = `${+keyParts[0] + xGridDiff}:${+keyParts[1] + yGridDiff}`;
                    newThings[newKey] = plucked;
                }
            }
            Object.assign(draft[state.cameraZ], newThings);
            updateWallNeighbors(state, draft);
        });
        const buildingPositions = produce(state.buildingPositions, (draft) => {
            const newThings = {};
            for (const key of Object.keys(draft[state.cameraZ])) {
                if (state.inspectedBuildings.some((m) => m === draft[state.cameraZ][key])) {
                    const plucked = draft[state.cameraZ][key];
                    delete draft[state.cameraZ][key];
                    const pluckParts = plucked.split(":");
                    const newCenter = `${+pluckParts[0] + xGridDiff}:${+pluckParts[1] + yGridDiff}`;
                    const keyParts = key.split(":");
                    const newKey = `${+keyParts[0] + xGridDiff}:${+keyParts[1] + yGridDiff}`;
                    newThings[newKey] = newCenter;
                }
            }
            Object.assign(draft[state.cameraZ], newThings);
        });

        const inspectedBuildings = state.inspectedBuildings.map((e) => {
            const parts = e.split(":");
            return `${+parts[0] + xGridDiff}:${+parts[1] + yGridDiff}`;
        });

        dispatch(_moveInspectedBuildings(buildingTiles, buildingPositions, inspectedBuildings));
    };
}

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

export function inspectGridPos(gridX: number, gridY: number, add?: boolean) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        const [mapX, mapY] = getMapCoord(gridX, gridY, state);
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
