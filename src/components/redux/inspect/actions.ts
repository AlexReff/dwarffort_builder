import produce from "immer";
import { ACTION_TYPE, IBuildingState, IInspectState, store } from "../";
import { MENU_ID, Point, TILE_H, TILE_W } from "../../constants";
import { getMapCoord, updateWallNeighbors } from "../../util";
import { FlatGetState } from "../helpers";

//#region REDUX ACTIONS

export function setInspectBuildings(inspectedBuildings: string[]) {
    return {
        type: ACTION_TYPE.SET_INSPECT_BUILDINGS as const,
        inspectedBuildings,
    };
}

export function addInspectBuilding(item: string) {
    return {
        type: ACTION_TYPE.ADD_INSPECT_BUILDING as const,
        item,
    };
}

export function addInspectBuildings(items: string[]) {
    return {
        type: ACTION_TYPE.ADD_INSPECT_BUILDINGS as const,
        items,
    };
}

export function removeInspectBuildings(items: string[]) {
    return {
        type: ACTION_TYPE.REMOVE_INSPECT_BUILDINGS as const,
        items,
    };
}

export function highlightBuildings(items: string[]) {
    return {
        type: ACTION_TYPE.HIGHLIGHT_BUILDINGS as const,
        items,
    };
}

export function clearHighlightBuildings() {
    return {
        type: ACTION_TYPE.HIGHLIGHT_BUILDINGS_CLEAR as const,
    };
}

export function _moveInspectedBuildings(
    buildingTiles: IBuildingState["buildingTiles"],
    buildingPositions: IBuildingState["buildingPositions"],
    inspectedBuildings: IInspectState["inspectedBuildings"],
) {
    return {
        type: ACTION_TYPE.MOVE_INSPECT_BUILDINGS as const,
        buildingTiles,
        buildingPositions,
        inspectedBuildings,
    };
}

//#endregion
//#region THUNK ACTIONS

export function inspectGridRange(gridA: Point, gridB: Point) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
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

        const inspectedBuildings = state.shiftDown ?
            state.inspectedBuildings.concat(bldgVals.filter((m) => !state.inspectedBuildings.some((n) => n === m)))
            : bldgVals;

        dispatch(setInspectBuildings(inspectedBuildings));
    };
}

export function moveInspectedBuildings(diffX: number, diffY: number) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);

        const cameraZ = state.cameraZ;
        const terrainTiles = state.terrainTiles;
        const buildingTiles = state.buildingTiles;
        const inspectedBuildings = state.inspectedBuildings;
        const buildingPositions = state.buildingPositions;

        if (!(cameraZ in terrainTiles) ||
            !(cameraZ in buildingTiles)) {
            return;
        }

        const xGridDiff = Math.floor(diffX / TILE_W);
        const yGridDiff = Math.floor(diffY / TILE_H);

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
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = getState();
        if (state.inspect.inspectedBuildings.some((e) => e === item)) {
            dispatch(removeInspectBuildings([item]));
        } else {
            dispatch(addInspectBuilding(item));
        }
    };
}

export function inspectGridPos(gridX: number, gridY: number) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        const [mapX, mapY] = getMapCoord(gridX, gridY, state);
        dispatch(inspectMapPos(mapX, mapY));
    };
}

export function inspectAllOfType(type: MENU_ID) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        const cameraZ = state.cameraZ;
        const buildingPositions = state.buildingPositions;
        const buildingTiles = state.buildingTiles;
        if (cameraZ in buildingPositions) {
            const matchedKeys = [];
            for (const key of Object.keys(buildingTiles[cameraZ])) {
                const trg = buildingTiles[cameraZ][key];
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
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        const cameraZ = state.cameraZ;
        const buildingPositions = state.buildingPositions;
        const buildingTiles = state.buildingTiles;
        if (cameraZ in buildingPositions) {
            const [mapX, mapY] = getMapCoord(gridX, gridY, state);
            const key = `${mapX}:${mapY}`;
            if (key in buildingPositions[cameraZ]) {
                const center = buildingPositions[cameraZ][key];
                const bldg = buildingTiles[cameraZ][center];
                dispatch(inspectAllOfType(bldg.key));
            }
        }
    };
}

export function inspectMapPos(mapX: number, mapY: number) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
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
