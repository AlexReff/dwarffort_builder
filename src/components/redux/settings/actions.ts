import { DEFAULTS, TILE_H, TILE_W } from "../../constants";
import { getCursorTiles } from "../cursor/cursor";
import { ACTION_TYPE, FlatGetState } from "../store";

export function Initialize(container: any) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);

        state.gridWidth = Math.floor(container.offsetWidth / TILE_W);
        state.gridHeight = Math.floor(container.offsetHeight / TILE_H);

        state.mapWidth = Math.max(DEFAULTS.MAP_MIN_W, state.gridWidth);
        state.mapHeight = Math.max(DEFAULTS.MAP_MIN_H, state.gridHeight);

        state.cameraX = Math.floor((state.mapWidth - state.gridWidth) / 2);
        state.cameraY = Math.floor((state.mapHeight - state.gridHeight) / 2);

        state.cursorX = Math.floor(state.mapWidth / 2.0);
        state.cursorY = Math.floor(state.mapHeight / 2.0);

        state.cursorTiles = getCursorTiles(state);
        dispatch(_initialize(state.gridWidth, state.gridHeight, state.mapWidth, state.mapHeight, state.cameraX, state.cameraY, state.cursorX, state.cursorY, state.cursorTiles));
    };
}

export function _initialize(gridWidth, gridHeight, mapWidth, mapHeight, cameraX, cameraY, cursorX, cursorY, cursorTiles) {
    return {
        type: ACTION_TYPE.INITIALIZE,
        gridWidth,
        gridHeight,
        mapWidth,
        mapHeight,
        cameraX,
        cameraY,
        cursorX,
        cursorY,
        cursorTiles,
    };
}

export const setStrictMode = (val: boolean) => {
    return {
        type: ACTION_TYPE.SET_STRICT_MODE,
        val,
    };
};
