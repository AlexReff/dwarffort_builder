import { IRenderTile, MENU_ID, Point, TILE_H, TILE_W, WALL_TILES } from "./constants";
import { Game } from "./game";
import { FlatGetState, FlatReduxState, IBuildingState, ReduxState, store } from "./redux/";
import rng from "./rot/rng";

export const renderTile = (_this: Game, tile: IRenderTile) => {
    const parms = getDisplayParms(tile, _this);
    _this.rotDisplay.draw.apply(_this.rotDisplay, parms);
};

export const getDisplayParms = (tile: IRenderTile, _state?: FlatReduxState) => {
    const [x, y] = getGridCoord(tile.x, tile.y, _state);
    if (Array.isArray(tile.color)) {
        const bg = typeof tile.bg !== "undefined" ? tile.bg : tile.color.map((z) => "transparent");
        return [
            x,
            y,
            tile.char,
            tile.color,
            bg,
        ];
    } else {
        const bg = typeof tile.bg !== "undefined" ? tile.bg : "transparent";
        return [
            x,
            y,
            tile.char,
            tile.color,
            bg,
        ];
    }
};

export const eventToPosition = (e: TouchEvent | MouseEvent, rect: ReturnType<HTMLElement["getBoundingClientRect"]>): Point => {
    let x, y;
    if ("touches" in e) {
        x = e.touches[0].clientX;
        y = e.touches[1].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }
    x -= rect.left;
    y -= rect.top;

    x *= rect.width / rect.width;
    y *= rect.height / rect.height;

    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) { return [-1, -1]; }

    return _normalizedEventToPosition(x, y);
};

function _normalizedEventToPosition(x: number, y: number): Point {
    return [Math.floor(x / TILE_W), Math.floor(y / TILE_H)];
}

/** Converts MAP coord to GRID coord */
export const getGridCoord = (x: number, y: number, _state?: FlatReduxState): [number, number] => {
    const state = _state || FlatGetState({}, store.getState);
    if (x < state.cameraX ||
        y < state.cameraY ||
        x > state.cameraX + state.gridWidth ||
        y > state.cameraY + state.gridHeight) {
        return [-1, -1];
    }
    return [
        x - state.cameraX,
        y - state.cameraY,
    ];
};

/** Converts GRID coord to MAP coord */
export const getMapCoord = (gridX: number, gridY: number, _state?: ReduxState | FlatReduxState): [number, number] => {
    //const state = _state || FlatGetState({}, store.getState);
    let cameraX, cameraY, mapWidth, mapHeight;
    if (typeof _state === "undefined" || _state == null) {
        _state = store.getState();
    }
    if (isFlatReduxState(_state)) {
        cameraX = _state.cameraX;
        cameraY = _state.cameraY;
        mapHeight = _state.mapHeight;
        mapWidth = _state.mapWidth;
    } else {
        cameraX = _state.camera.cameraX;
        cameraY = _state.camera.cameraY;
        mapHeight = _state.camera.mapHeight;
        mapWidth = _state.camera.mapWidth;
    }
    if (gridX < 0 ||
        gridY < 0 ||
        gridX + cameraX > mapWidth ||
        gridY + cameraY > mapHeight) {
        return [-1, -1];
    }
    return [
        gridX + cameraX,
        gridY + cameraY,
    ];
};

export const getNeighborsOfRange = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    state: ReduxState | FlatReduxState,
): Point[] => {
    const dict = {};
    let mapWidth, mapHeight;
    if (isFlatReduxState(state)) {
        mapHeight = state.mapHeight;
        mapWidth = state.mapWidth;
    } else {
        mapHeight = state.camera.mapHeight;
        mapWidth = state.camera.mapWidth;
    }
    if (startY > 0) {
        //add 'top'
        const xStart = Math.max(startX - 1, 0);
        const xStop = Math.min(endX + 1, mapWidth - 1);
        for (let x = xStart; x <= xStop; x++) {
            dict[`${x}:${startY - 1}`] = [x, startY - 1];
        }
    }
    if (startX > 0) {
        //add 'left'
        const yStart = Math.max(startY - 1, 0);
        const yStop = Math.min(endY + 1, mapHeight - 1);
        for (let y = yStart; y <= yStop; y++) {
            dict[`${startX - 1}:${y}`] = [startX - 1, y];
        }
    }
    if (endY + 1 < mapHeight) {
        //add 'bot'
        const xStart = Math.max(startX - 1, 0);
        const xStop = Math.min(endX + 1, mapWidth - 1);
        for (let x = xStart; x <= xStop; x++) {
            dict[`${x}:${endY + 1}`] = [x, endY + 1];
        }
    }
    if (endX + 1 < mapWidth) {
        //add 'right'
        const yStart = Math.max(startY - 1, 0);
        const yStop = Math.min(endY + 1, mapHeight - 1);
        for (let y = yStart; y <= yStop; y++) {
            dict[`${endX + 1}:${y}`] = [endX + 1, y];
        }
    }
    const result = [];
    for (const key of Object.keys(dict)) {
        result.push(dict[key]);
    }
    return result;
};

export const isFlatReduxState = (varToCheck: any): varToCheck is FlatReduxState => {
    if (typeof varToCheck.camera === "undefined") {
        return true;
    }
    return false;
};

/** @returns true if a building can be placed on the specified tile  */
export const isBuildingPlaceable = (state: FlatReduxState | ReduxState, x: number, y: number): boolean => {
    let cameraZ, terrainTiles, buildingPositions;
    if (isFlatReduxState(state)) {
        cameraZ = state.cameraZ;
        terrainTiles = state.terrainTiles;
        buildingPositions = state.buildingPositions;
    } else {
        cameraZ = state.camera.cameraZ;
        terrainTiles = state.digger.terrainTiles;
        buildingPositions = state.building.buildingPositions;
    }
    if (!(cameraZ in terrainTiles)) {
        return false; //no terrain on this z-level
    }
    const key = `${x}:${y}`;
    if (!(key in terrainTiles[cameraZ])) {
        return false; //no terrain for this position
    }
    if (cameraZ in buildingPositions) {
        if (key in buildingPositions[cameraZ]) {
            return false; //building found at location
        }
    }
    const tile = terrainTiles[cameraZ][key];
    if (tile != null && tile.type === MENU_ID.mine) {
        return true;
    }

    return false;
};

export function updateWallNeighbors(state: ReduxState, buildingTiles: IBuildingState["buildingTiles"]) {
    for (let y = 0; y < state.camera.mapHeight; y++) {
        for (let x = 0; x < state.camera.mapWidth; x++) {
            const key = `${x}:${y}`;
            if (key in buildingTiles[state.camera.cameraZ]) {
                if (buildingTiles[state.camera.cameraZ][key].key === MENU_ID.wall) {
                    buildingTiles[state.camera.cameraZ][key].characterVariant = getWallNeighborFlags(buildingTiles, state, x, y);
                }
            }
        }
    }
}

export function getWallNeighborFlags(
    tiles: IBuildingState["buildingTiles"],
    state: ReduxState,
    x: number,
    y: number,
    z: number = state.camera.cameraZ) {
    let flags = 0;
    if (y > 0) {
        const nKey = `${x}:${y - 1}`;
        if ((nKey in tiles[z] && tiles[z][nKey].key === MENU_ID.wall) ||
            (nKey in state.digger.terrainTiles[z] && state.digger.terrainTiles[z][nKey].type === MENU_ID.wall)) {
            flags += 1;
        }
    }
    if (x < state.camera.mapWidth - 1) {
        const eKey = `${x + 1}:${y}`;
        if ((eKey in tiles[z] && tiles[z][eKey].key === MENU_ID.wall) ||
            (eKey in state.digger.terrainTiles[z] && state.digger.terrainTiles[z][eKey].type === MENU_ID.wall)) {
            flags += 2;
        }
    }
    if (y < state.camera.mapHeight - 1) {
        const sKey = `${x}:${y + 1}`;
        if ((sKey in tiles[z] && tiles[z][sKey].key === MENU_ID.wall) ||
            (sKey in state.digger.terrainTiles[z] && state.digger.terrainTiles[z][sKey].type === MENU_ID.wall)) {
            flags += 4;
        }
    }
    if (x > 0) {
        const wKey = `${x - 1}:${y}`;
        if ((wKey in tiles[z] && tiles[z][wKey].key === MENU_ID.wall) ||
            (wKey in state.digger.terrainTiles[z] && state.digger.terrainTiles[z][wKey].type === MENU_ID.wall)) {
            flags += 8;
        }
    }

    let result = flags.toString();

    if (WALL_TILES[flags].length > 1) {
        //append 'a'/'b' etc to end for variant mapping
        const rnd = rng.getUniformInt(0, WALL_TILES[flags].length - 1);
        result += String.fromCharCode(rnd + 97);
    }

    return result;
}

export function debounce(func: (...args: any[]) => any, wait: number, immediate: boolean) {
    let timeout: any;
    return () => {
        const context = this, args = arguments;
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (callNow) { func.apply(context, args); }
    };
}
