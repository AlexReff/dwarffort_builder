import { IRenderTile, MENU_ID, Point, TILE_H, TILE_W, WALL_TILES } from "./constants";
import { GameReduxState } from "./game";
import { FlatGetState, FlatReduxState, IBuildingState, ReduxState, store } from "./redux/";
import Display from "./rot/display";
import rng from "./rot/rng";

export const isPointValid = (point: Point) => {
    if (point == null ||
        point.length !== 2 ||
        point[0] < 0 ||
        point[1] < 0) {
        return false;
    }
    return true;
};

export const renderTile = (tile: IRenderTile, display: Display, state: IGetGridCoordState) => {
    const parms = getDisplayParms(tile, state);
    display.draw.apply(display, parms);
};

export const getDisplayParms = (tile: IRenderTile, _state: IGetGridCoordState) => {
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

export const eventToPosition = (
    e: TouchEvent | MouseEvent,
    rect: ReturnType<HTMLElement["getBoundingClientRect"]>,
): Point => {
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
type IGetGridCoordState = Pick<FlatReduxState,
    "cameraX" |
    "cameraY" |
    "gridWidth" |
    "gridHeight"
>;
export const getGridCoord = (x: number, y: number, _state?: IGetGridCoordState): [number, number] => {
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
export const getMapCoord = (
    gridX: number,
    gridY: number,
    state: Pick<FlatReduxState, "cameraX" | "cameraY" | "mapHeight" | "mapWidth"
    > = FlatGetState({}, store.getState),
): [number, number] => {
    if (gridX < 0 ||
        gridY < 0 ||
        gridX + state.cameraX > state.mapWidth ||
        gridY + state.cameraY > state.mapHeight) {
        return [-1, -1];
    }
    return [
        gridX + state.cameraX,
        gridY + state.cameraY,
    ];
};

export const getNeighborsOfRange = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    state: Pick<FlatReduxState, "mapHeight" | "mapWidth">,
): Point[] => {
    const dict = {};
    const mapWidth = state.mapWidth;
    const mapHeight = state.mapHeight;
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

/** @returns true if a building can be placed on the specified tile  */
export const isBuildingPlaceable = (
    state: Pick<FlatReduxState, "cameraZ" | "terrainTiles" | "buildingPositions">,
    x: number,
    y: number,
): boolean => {
    const cameraZ = state.cameraZ;
    const terrainTiles = state.terrainTiles;
    const buildingPositions = state.buildingPositions;
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

export function updateWallNeighbors(
    state: Pick<FlatReduxState, "mapHeight" | "mapWidth" | "cameraZ" | "terrainTiles">,
    buildingTiles: IBuildingState["buildingTiles"],
) {
    for (let y = 0; y < state.mapHeight; y++) {
        for (let x = 0; x < state.mapWidth; x++) {
            const key = `${x}:${y}`;
            if (key in buildingTiles[state.cameraZ]) {
                if (buildingTiles[state.cameraZ][key].key === MENU_ID.wall) {
                    buildingTiles[state.cameraZ][key].characterVariant = getWallNeighborFlags(buildingTiles, state, x, y);
                }
            }
        }
    }
}

export const getWallNeighborFlags = (
    tiles: IBuildingState["buildingTiles"],
    state: Pick<FlatReduxState, "cameraZ" | "terrainTiles" | "mapWidth" | "mapHeight">,
    x: number,
    y: number,
    z: number = state.cameraZ,
) => {
    let flags = 0;
    if (y > 0) {
        const nKey = `${x}:${y - 1}`;
        if ((nKey in tiles[z] && tiles[z][nKey].key === MENU_ID.wall) ||
            (nKey in state.terrainTiles[z] && state.terrainTiles[z][nKey].type === MENU_ID.wall)) {
            flags += 1;
        }
    }
    if (x < state.mapWidth - 1) {
        const eKey = `${x + 1}:${y}`;
        if ((eKey in tiles[z] && tiles[z][eKey].key === MENU_ID.wall) ||
            (eKey in state.terrainTiles[z] && state.terrainTiles[z][eKey].type === MENU_ID.wall)) {
            flags += 2;
        }
    }
    if (y < state.mapHeight - 1) {
        const sKey = `${x}:${y + 1}`;
        if ((sKey in tiles[z] && tiles[z][sKey].key === MENU_ID.wall) ||
            (sKey in state.terrainTiles[z] && state.terrainTiles[z][sKey].type === MENU_ID.wall)) {
            flags += 4;
        }
    }
    if (x > 0) {
        const wKey = `${x - 1}:${y}`;
        if ((wKey in tiles[z] && tiles[z][wKey].key === MENU_ID.wall) ||
            (wKey in state.terrainTiles[z] && state.terrainTiles[z][wKey].type === MENU_ID.wall)) {
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
};

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
