import { IRenderTile, Point } from "./constants";
import store, { FlatGetState, FlatReduxState } from "./redux/store";
import Display from "./rot/display";

export const renderTile = (display: Display, tile: IRenderTile, _state?: FlatReduxState) => {
    const parms = getDisplayParms(tile, _state);
    display.draw.apply(display, parms);
};

export const getDisplayParms = (tile: IRenderTile, _state?: FlatReduxState) => {
    const [x, y] = getGridCoord(tile.x, tile.y, _state);
    if (Array.isArray(tile.color)) {
        const colorArray = tile.color.map((z) => "transparent");
        return [
            x,
            y,
            tile.char,
            tile.color,
            colorArray,
        ];
    } else {
        return [
            x,
            y,
            tile.char,
            tile.color,
            "transparent",
        ];
    }
};

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
