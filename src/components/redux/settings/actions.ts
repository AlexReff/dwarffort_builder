import { DEFAULTS, TILE_H, TILE_W } from "../../constants";
import { ACTION_TYPE } from "../store";

export function Initialize(container: any) {
    const gridWidth = Math.floor(container.offsetWidth / TILE_W);
    const gridHeight = Math.floor(container.offsetHeight / TILE_H);

    const mapWidth = Math.max(DEFAULTS.MAP_MIN_W, gridWidth);
    const mapHeight = Math.max(DEFAULTS.MAP_MIN_H, gridHeight);

    const cameraX = Math.floor((mapWidth - gridWidth) / 2);
    const cameraY = Math.floor((mapHeight - gridHeight) / 2);

    const cursorX = Math.floor(mapWidth / 2.0);
    const cursorY = Math.floor(mapHeight / 2.0);

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
    };
}

export const setStrictMode = (val: boolean) => {
    return {
        type: ACTION_TYPE.SET_STRICT_MODE,
        val,
    };
};
