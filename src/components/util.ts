import { IRenderTile } from "./constants";
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
