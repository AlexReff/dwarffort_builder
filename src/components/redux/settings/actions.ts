import { DEFAULTS, TILE_H, TILE_W } from "../../constants";
import { ACTION_TYPE } from "../store";

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
        type: ACTION_TYPE.INITIALIZE,
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
        type: ACTION_TYPE.ANIMATION_TOGGLE,
    };
};

// export const setStrictMode = (val: boolean) => {
//     return {
//         type: ACTION_TYPE.SET_STRICT_MODE,
//         val,
//     };
// };

//#endregion
//#region THUNK ACTIONS

//#endregion
