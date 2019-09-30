import { IRenderTile, MENU_ITEM, Point, TILE_H, TILE_W } from "./constants";
import { Game } from "./game";
import store, { FlatGetState, FlatReduxState } from "./redux/store";

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
export const getMapCoord = (x: number, y: number, _state?: FlatReduxState): [number, number] => {
    const state = _state || FlatGetState({}, store.getState);
    if (x < 0 ||
        y < 0 ||
        x + state.cameraX > state.mapWidth ||
        y + state.cameraY > state.mapHeight) {
        return [-1, -1];
    }
    return [
        x + state.cameraX,
        y + state.cameraY,
    ];
};

export const getNeighborsOfRange = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    state: FlatReduxState,
): Point[] => {
    const dict = {};
    if (startY > 0) {
        //add 'top'
        const xStart = Math.max(startX - 1, 0);
        const xStop = Math.min(endX + 1, state.mapWidth - 1);
        for (let x = xStart; x <= xStop; x++) {
            dict[`${x}:${startY - 1}`] = [x, startY - 1];
        }
    }
    if (startX > 0) {
        //add 'left'
        const yStart = Math.max(startY - 1, 0);
        const yStop = Math.min(endY + 1, state.mapHeight - 1);
        for (let y = yStart; y <= yStop; y++) {
            dict[`${startX - 1}:${y}`] = [startX - 1, y];
        }
    }
    if (endY + 1 < state.mapHeight) {
        //add 'bot'
        const xStart = Math.max(startX - 1, 0);
        const xStop = Math.min(endX + 1, state.mapWidth - 1);
        for (let x = xStart; x <= xStop; x++) {
            dict[`${x}:${endY + 1}`] = [x, endY + 1];
        }
    }
    if (endX + 1 < state.mapWidth) {
        //add 'right'
        const yStart = Math.max(startY - 1, 0);
        const yStop = Math.min(endY + 1, state.mapHeight - 1);
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
export const isBuildingPlaceable = (state: FlatReduxState, x: number, y: number): boolean => {
    if (!(state.cameraZ in state.terrainTiles)) {
        return false; //no terrain on this z-level
    }
    const key = `${x}:${y}`;
    if (!(key in state.terrainTiles[state.cameraZ])) {
        return false; //no terrain for this position
    }
    if (state.cameraZ in state.buildingPositions) {
        if (key in state.buildingPositions[state.cameraZ]) {
            return false; //building found at location
        }
    }
    const tile = state.terrainTiles[state.cameraZ][key];
    if (tile != null && tile.type === MENU_ITEM.mine) {
        return true;
    }

    return false;
};
