import produce from "immer";
import { MENU_ID } from "src/components/constants/menu/_data";
import { Point, TILE_H, TILE_W } from "../../constants";
import { getMapCoord, updateWallNeighbors } from "../../util";
import { ACTION_TYPE, ReduxState } from "../store";

//#region REDUX ACTIONS

export function setInspectBuildings(inspectedBuildings: string[]) {
    return {
        type: ACTION_TYPE.SET_INSPECT_BUILDINGS,
        inspectedBuildings,
    };
}

export function addInspectBuilding(item: string) {
    return {
        type: ACTION_TYPE.ADD_INSPECT_BUILDING,
        item,
    };
}

export function addInspectBuildings(items: string[]) {
    return {
        type: ACTION_TYPE.ADD_INSPECT_BUILDINGS,
        items,
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

export function inspectGridRange(gridA: Point, gridB: Point) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        if (state.building.buildingPositions == null ||
            !(state.camera.cameraZ in state.building.buildingPositions) ||
            Object.keys(state.building.buildingPositions[state.camera.cameraZ]).length === 0) {
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
                if (key in state.building.buildingPositions[state.camera.cameraZ]) {
                    bldgKeys.add(state.building.buildingPositions[state.camera.cameraZ][key]);
                }
            }
        }

        const bldgVals = Array.from(bldgKeys.values());

        const inspectedBuildings = state.input.shiftDown ? state.inspect.inspectedBuildings.concat(bldgVals.filter((m) => !state.inspect.inspectedBuildings.some((n) => n === m))) : bldgVals;

        dispatch(setInspectBuildings(inspectedBuildings));
    };
}

export function moveInspectedBuildings(diffX: number, diffY: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();

        const cameraZ = state.camera.cameraZ;
        const terrainTiles = state.digger.terrainTiles;
        const buildingTiles = state.building.buildingTiles;
        const inspectedBuildings = state.inspect.inspectedBuildings;
        const buildingPositions = state.building.buildingPositions;

        if (!(cameraZ in terrainTiles) ||
            !(cameraZ in buildingTiles)) {
            return;
        }

        const xGridDiff = Math.floor(diffX / +TILE_W);
        const yGridDiff = Math.floor(diffY / +TILE_H);

        const allNewPositions = [];
        //validate no building is in the way
        for (const bldgKey of inspectedBuildings) {
            const bldgPositions = Object.keys(buildingPositions[cameraZ]).filter((m) => buildingPositions[cameraZ][m] === bldgKey);
            for (const pos of bldgPositions) {
                const parts = pos.split(":");
                const newPos = `${+parts[0] + xGridDiff}:${+parts[1] + yGridDiff}`;
                allNewPositions.push(newPos);
                if (newPos in buildingPositions[cameraZ]) {
                    if (!inspectedBuildings.some((e) => e === buildingPositions[cameraZ][newPos])) {
                        return; //non-inspected building found at new position
                    }
                }
            }
        }
        //validate terrain
        for (const pos of allNewPositions) {
            if (!(pos in terrainTiles[cameraZ])) {
                return; //no floor
            }
            if (terrainTiles[cameraZ][pos].type !== MENU_ID.mine) {
                return; //non-floor detected
            }
        }
        const newBuildingTiles = produce(buildingTiles, (draft) => {
            const newThings = {};
            for (const key of Object.keys(draft[cameraZ])) {
                if (inspectedBuildings.some((m) => m === key)) {
                    const plucked = draft[cameraZ][key];
                    delete draft[cameraZ][key];
                    plucked.posX += xGridDiff;
                    plucked.posY += yGridDiff;
                    const keyParts = key.split(":");
                    const newKey = `${+keyParts[0] + xGridDiff}:${+keyParts[1] + yGridDiff}`;
                    newThings[newKey] = plucked;
                }
            }
            Object.assign(draft[cameraZ], newThings);
            updateWallNeighbors(state, draft);
        });
        const newBuildingPositions = produce(buildingPositions, (draft) => {
            const newThings = {};
            for (const key of Object.keys(draft[cameraZ])) {
                if (inspectedBuildings.some((m) => m === draft[cameraZ][key])) {
                    const plucked = draft[cameraZ][key];
                    delete draft[cameraZ][key];
                    const pluckParts = plucked.split(":");
                    const newCenter = `${+pluckParts[0] + xGridDiff}:${+pluckParts[1] + yGridDiff}`;
                    const keyParts = key.split(":");
                    const newKey = `${+keyParts[0] + xGridDiff}:${+keyParts[1] + yGridDiff}`;
                    newThings[newKey] = newCenter;
                }
            }
            Object.assign(draft[cameraZ], newThings);
        });

        const newInspectedBuildings = inspectedBuildings.map((e) => {
            const parts = e.split(":");
            return `${+parts[0] + xGridDiff}:${+parts[1] + yGridDiff}`;
        });

        dispatch(_moveInspectedBuildings(newBuildingTiles, newBuildingPositions, newInspectedBuildings));
    };
}

export function toggleInspectBuilding(item: string) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        if (state.inspect.inspectedBuildings.some((e) => e === item)) {
            dispatch(removeInspectBuilding(item));
        } else {
            dispatch(addInspectBuilding(item));
        }
    };
}

export function inspectGridPos(gridX: number, gridY: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        const [mapX, mapY] = getMapCoord(gridX, gridY, state);
        dispatch(inspectMapPos(mapX, mapY));
    };
}

export function inspectAllOfType(type: MENU_ID) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        const cameraZ = state.camera.cameraZ;
        const buildingPositions = state.building.buildingPositions;
        const buildingTiles = state.building.buildingTiles;
        if (cameraZ in buildingPositions) {
            const matchedKeys = [];
            for (const key of Object.keys(buildingTiles[state.camera.cameraZ])) {
                const trg = buildingTiles[state.camera.cameraZ][key];
                if (trg.key === type) {
                    matchedKeys.push(key);
                }
            }
            if (matchedKeys.length > 0) {
                dispatch(setInspectBuildings(matchedKeys));
            }
        }
    };
}

export function inspectAllOfTypeAtGridPos(gridX: number, gridY: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        const cameraZ = state.camera.cameraZ;
        const buildingPositions = state.building.buildingPositions;
        const buildingTiles = state.building.buildingTiles;
        if (cameraZ in buildingPositions) {
            const [mapX, mapY] = getMapCoord(gridX, gridY, state);
            const key = `${mapX}:${mapY}`;
            if (key in buildingPositions[cameraZ]) {
                const center = buildingPositions[cameraZ][key];
                const bldg = buildingTiles[cameraZ][center];
                dispatch(inspectAllOfType(bldg.key));
                // const inspected = [];
                // for (const bldgKey of Object.keys(buildingTiles[cameraZ])) {
                //     const target = buildingTiles[cameraZ][bldgKey];
                //     if (target.key === bldg.key) {
                //         inspected.push(`${target.posX}:${target.posY}`);
                //     }
                // }
                // if (inspected.length > 0) {
                //     if (state.input.shiftDown) {
                //         dispatch(addInspectBuildings(inspected));
                //     } else {
                //         dispatch(setInspectBuildings(inspected));
                //     }
                // }
            }
        }
    };
}

export function inspectMapPos(mapX: number, mapY: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        if (state.camera.cameraZ in state.building.buildingPositions) {
            const key = `${mapX}:${mapY}`;
            if (key in state.building.buildingPositions[state.camera.cameraZ]) {
                const idKey = state.building.buildingPositions[state.camera.cameraZ][key];
                if (idKey in state.building.buildingTiles[state.camera.cameraZ]) {
                    if (state.input.shiftDown) {
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
