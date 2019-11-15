import { ACTION_TYPE, ReduxState, store } from "../";
import { TILE_H, TILE_W } from "../../constants";
import { moveCursorToPos, setCursorPos } from "../cursor/actions";

//#region REDUX ACTIONS

export function setCameraPos(x: number, y: number) {
    return {
        type: ACTION_TYPE.SET_CAMERA_POS as const,
        x,
        y,
    };
}

export function setCameraZ(z: number) {
    return {
        type: ACTION_TYPE.SET_ZLEVEL as const,
        z,
    };
}

export function setMapSize(mapWidth: number, mapHeight: number, gridWidth: number, gridHeight: number) {
    return {
        type: ACTION_TYPE.SET_MAP_SIZE as const,
        mapWidth,
        mapHeight,
        gridWidth,
        gridHeight,
    };
}

//#endregion
//#region THUNK ACTIONS

export function resizeWindow(container: HTMLElement) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state: ReduxState = getState();

        const gridWidth = Math.floor(container.offsetWidth / TILE_W);
        const gridHeight = Math.floor(container.offsetHeight / TILE_H);

        const mapWidth = Math.max(state.camera.mapWidth, gridWidth);
        const mapHeight = Math.max(state.camera.mapHeight, gridHeight);

        //increase grid/map sizes if necessary
        dispatch(setMapSize(mapWidth, mapHeight, gridWidth, gridHeight));
        //ensure camera is updated to include cursor position
        dispatch(moveCursorToPos(state.cursor.cursorX, state.cursor.cursorY));
    };
}

//#endregion
