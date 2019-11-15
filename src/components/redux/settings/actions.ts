import { ACTION_TYPE } from "../";
import { DEFAULTS, TILE_H, TILE_W } from "../../constants";

//#region REDUX ACTIONS

export function Initialize(container: HTMLElement) {
    const gridWidth = Math.floor(container.offsetWidth / TILE_W);
    const gridHeight = Math.floor(container.offsetHeight / TILE_H);

    const mapWidth = Math.max(DEFAULTS.MAP_MIN_W, gridWidth);
    const mapHeight = Math.max(DEFAULTS.MAP_MIN_H, gridHeight);

    const cameraX = Math.floor((mapWidth - gridWidth) / 2.0);
    const cameraY = Math.floor((mapHeight - gridHeight) / 2.0);

    const cursorX = Math.floor(mapWidth / 2.0);
    const cursorY = Math.floor(mapHeight / 2.0);

    const gridBounds = container.getBoundingClientRect();

    return {
        type: ACTION_TYPE.INITIALIZE as const,
        gridWidth,
        gridHeight,
        mapWidth,
        mapHeight,
        cameraX,
        cameraY,
        cursorX,
        cursorY,
        gridBounds,
    };
}

export const toggleAnimation = () => {
    return {
        type: ACTION_TYPE.ANIMATION_TOGGLE as const,
    };
};

//#endregion
