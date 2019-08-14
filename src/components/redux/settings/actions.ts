import { ACTION_TYPE, Point } from "../../constants";

export function setStrictMode(val: boolean) {
    return {
        type: !!val ? ACTION_TYPE.STRICT_ENABLED : ACTION_TYPE.STRICT_DISABLED,
    };
}

export function Initialize(gridSize: Point, mapSize: Point, camera: Point , cursorPosition: Point) {
    return {
        type: ACTION_TYPE.INITIALIZE,
        gridSize,
        mapSize,
        camera,
        cursorPosition,
    };
}
