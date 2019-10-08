import { DIRECTION } from "../../constants";
import { setCameraPos } from "../camera/actions";
import { ACTION_TYPE, ReduxState } from "../store";

//#region REDUX ACTIONS

/** DO NOT CALL DIRECTLY -- USE 'moveCursorToPos' INSTEAD */
export function setCursorPos(cursorX: number, cursorY: number) {
    return {
        type: ACTION_TYPE.SET_CURSOR_POS,
        cursorX,
        cursorY,
    };
}

//#endregion
//#region THUNK ACTIONS

export function moveCursorDirection(dir: DIRECTION, shiftPressed: boolean = false) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        let cursorX = state.cursor.cursorX;
        let cursorY = state.cursor.cursorY;
        const cursorRadius = state.cursor.cursorRadius;
        const mapWidth = state.camera.mapWidth;
        const mapHeight = state.camera.mapHeight;
        const distance = shiftPressed ? 10 : 1;

        switch (dir) {
            case DIRECTION.N:
                if (cursorY - cursorRadius > 0) {
                    cursorY = Math.max(cursorRadius, cursorY - distance);
                }
                break;
            case DIRECTION.NE:
                if (cursorY - cursorRadius > 0 ||
                    cursorX + cursorRadius < mapWidth - 1) {
                    cursorX = Math.min(mapWidth - 1 - cursorRadius, cursorX + distance);
                    cursorY = Math.max(cursorRadius, cursorY - distance);
                }
                break;
            case DIRECTION.E:
                if (cursorX + cursorRadius < mapWidth - 1) {
                    cursorX = Math.min(mapWidth - 1 - cursorRadius + 0, cursorX + distance);
                }
                break;
            case DIRECTION.SE:
                if (cursorX + cursorRadius < mapWidth - 1 ||
                    cursorY + cursorRadius < mapHeight - 1) {
                    cursorX = Math.min(mapWidth - 1 - cursorRadius, cursorX + distance);
                    cursorY = Math.min(mapHeight - 1 - cursorRadius, cursorY + distance);
                }
                break;
            case DIRECTION.S:
                if (cursorY + cursorRadius < mapHeight - 1) {
                    cursorY = Math.min(mapHeight - 1 - cursorRadius, cursorY + distance);
                }
                break;
            case DIRECTION.SW:
                if (cursorX - cursorRadius > 0 ||
                    cursorY + cursorRadius < mapHeight - 1) {
                    cursorX = Math.max(cursorRadius, cursorX - 1);
                    cursorY = Math.min(mapHeight - 1 - cursorRadius, cursorY + distance);
                }
                break;
            case DIRECTION.W:
                if (cursorX - cursorRadius > 0) {
                    cursorX = Math.max(cursorRadius, cursorX - distance);
                }
                break;
            case DIRECTION.NW:
                if (cursorX - cursorRadius > 0 ||
                    cursorY - cursorRadius > 0) {
                    cursorX = Math.max(cursorRadius, cursorX - distance);
                    cursorY = Math.max(cursorRadius, cursorY - distance);
                }
                break;
            default:
                return;
        }

        dispatch(moveCursorToPos(cursorX, cursorY));
    };
}

export function moveCursorToGridPos(x: number, y: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        dispatch(moveCursorToPos(x + state.camera.cameraX, y + state.camera.cameraY));
    };
}

export function moveCursorToPos(x: number, y: number) {
    return (dispatch, getState: () => ReduxState) => {
        const state = getState();
        const mapWidth = state.camera.mapWidth;
        const mapHeight = state.camera.mapHeight;

        if (x < 0 || y < 0 ||
            x > mapWidth ||
            y > mapHeight) {
            return;
        }

        const gridWidth = state.camera.gridWidth;
        const gridHeight = state.camera.gridHeight;
        const cursorRadius = state.cursor.cursorRadius;
        const cameraX = state.camera.cameraX;
        const cameraY = state.camera.cameraY;
        let newX = cameraX;
        let newY = cameraY;

        //move camera to include cursor, if needed
        if (y - cursorRadius < cameraY) {
            //MOVE NORTH
            const dist = Math.ceil((cameraY - y + cursorRadius) / 10) * 10;
            const toMove = Math.max(0, cameraY - dist);
            newY = toMove;
        } else if (y + cursorRadius >= cameraY + gridHeight) {
            //MOVE SOUTH
            const dist = Math.ceil((y + cursorRadius - cameraY - (gridHeight - 1)) / 10) * 10;
            const toMove = Math.min(mapHeight - gridHeight, cameraY + dist);
            newY = toMove;
        }
        if (x - cursorRadius < cameraX) {
            //MOVE WEST
            const dist = Math.ceil((cameraX - x + cursorRadius) / 10) * 10;
            const toMove = Math.max(0, cameraX - dist);
            newX = toMove;
        } else if (x + cursorRadius >= cameraX + gridWidth) {
            //MOVE EAST
            const dist = Math.ceil((x + cursorRadius - cameraX - (gridWidth - 1)) / 10) * 10;
            const toMove = Math.min(mapWidth - gridWidth, cameraX + dist);
            newX = toMove;
        }

        if (cameraX !== newX || cameraY !== newY) {
            dispatch(setCameraPos(newX, newY));
        }

        dispatch(setCursorPos(x, y));
    };
}

//#endregion
