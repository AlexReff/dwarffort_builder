import { TILE_H, TILE_W } from "../../constants";
import { ACTION_TYPE, FlatGetState } from "../store";

export function setCameraPos(x: number, y: number) {
    return {
        type: ACTION_TYPE.SET_CAMERA_POS,
        x,
        y,
    };
}

export function setCameraZ(z: number) {
    return {
        type: ACTION_TYPE.SET_ZLEVEL,
        z,
    };
}

export function resizeWindow(container: HTMLElement) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);

        const gridWidth = Math.floor(container.offsetWidth / TILE_W);
        const gridHeight = Math.floor(container.offsetHeight / TILE_H);

        const mapWidth = Math.max(state.mapWidth, gridWidth);
        const mapHeight = Math.max(state.mapHeight, gridHeight);

        dispatch(setMapSize(mapWidth, mapHeight, gridWidth, gridHeight));
    };
}

export function setMapSize(mapWidth: number, mapHeight: number, gridWidth: number, gridHeight: number) {
    return {
        type: ACTION_TYPE.SET_MAP_SIZE,
        mapWidth,
        mapHeight,
        gridWidth,
        gridHeight,
    };
}
