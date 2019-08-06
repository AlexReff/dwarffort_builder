import { ACTION_TYPE, Point } from "../../constants";

export function hideCursor() {
    return {
        type: ACTION_TYPE.CURSOR_HIDE,
    };
}

export function showCursor() {
    return {
        type: ACTION_TYPE.CURSOR_SHOW,
    };
}

export function moveCursor(pos: Point) {
    return {
        type: ACTION_TYPE.CURSOR_MOVE,
        pos,
    };
}

export function setCursorRadius(radi: number) {
    return {
        type: ACTION_TYPE.CURSOR_SETRADIUS,
        radius: radi,
    };
}

export function setCursorCharacter(char: string) {
    return {
        type: ACTION_TYPE.CURSOR_SETCHAR,
        char,
    };
}

export function setCursorBuilding(building: boolean) {
    if (building) {
        return {
            type: ACTION_TYPE.CURSOR_BUILDING_START,
        };
    } else {
        return {
            type: ACTION_TYPE.CURSOR_BUILDING_END,
        };
    }
}
