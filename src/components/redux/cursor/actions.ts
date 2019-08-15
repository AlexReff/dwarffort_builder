import { ACTION_TYPE, Point } from "../../constants";
import { moveCamera } from "../camera/actions";

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

export function moveCursorRaw(pos: Point) {
    return {
        type: ACTION_TYPE.CURSOR_MOVE,
        pos,
    };
}

export function moveCursor(pos: Point) {
    return (dispatch, getState) => {
        const { camera, cursor } = getState();

        if (camera == null || cursor == null) {
            // dispatch(moveCursorRaw(pos));
            // console.log("Warning: Unsafe moveCursor detected @", pos);
            return;
        }

        if (pos[0] < 0 || pos[1] < 0 ||
            pos[0] > camera.mapSize[0] ||
            pos[1] > camera.mapSize[1]) {
            return;
        }
        const newPos = camera.camera.slice() as Point;
        if (pos[0] - cursor.cursorDiameter < camera.camera[0]) {
            //MOVE NORTH
            const dist = Math.ceil((camera.camera[0] - pos[0] + cursor.cursorDiameter) / 10) * 10;
            const toMove = Math.max(0, camera.camera[0] - dist);
            newPos[0] = toMove;
        } else if (pos[0] + cursor.cursorDiameter >= camera.camera[0] + camera.gridSize[0]) {
            //MOVE SOUTH
            const dist = Math.ceil((pos[0] + cursor.cursorDiameter - camera.camera[0] - (camera.gridSize[0] - 1)) / 10) * 10;
            const toMove = Math.min(camera.mapSize[0] - camera.gridSize[0], camera.camera[0] + dist);
            newPos[0] = toMove;
        }

        if (pos[1] - cursor.cursorDiameter < camera.camera[1]) {
            //MOVE WEST
            const dist = Math.ceil((camera.camera[1] - pos[1] + cursor.cursorDiameter) / 10) * 10;
            const toMove = Math.max(0, camera.camera[1] - dist);
            newPos[1] = toMove;
        } else if (pos[1] + cursor.cursorDiameter >= camera.camera[1] + camera.gridSize[1]) {
            //MOVE EAST
            const dist = Math.ceil((pos[1] + cursor.cursorDiameter - camera.camera[1] - (camera.gridSize[1] - 1)) / 10) * 10;
            const toMove = Math.min(camera.mapSize[1] - camera.gridSize[1], camera.camera[1] + dist);
            newPos[1] = toMove;
        }

        if (camera[0] !== newPos[0] || camera[1] !== newPos[1]) {
            dispatch(moveCamera(newPos));
        }

        dispatch(moveCursorRaw(pos));
    };
}

export function setCursorDiameter(diam: number) {
    return {
        type: ACTION_TYPE.CURSOR_SETDIAMETER,
        cursorDiameter: diam,
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
