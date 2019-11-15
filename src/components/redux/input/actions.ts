import { ACTION_TYPE } from "../";

//#region REDUX ACTIONS

export function setShiftDown(val: boolean) {
    return {
        type: ACTION_TYPE.SET_SHIFT_DOWN as const,
        val,
    };
}

//#endregion
