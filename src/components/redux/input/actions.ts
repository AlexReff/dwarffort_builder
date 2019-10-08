import { ACTION_TYPE } from "../store";

//#region REDUX ACTIONS

export function setShiftDown(val: boolean) {
    return {
        type: ACTION_TYPE.SET_SHIFT_DOWN,
        val,
    };
}

//#endregion
//#region THUNK ACTIONS

// export function inspectGridRange(gridA: Point, gridB: Point, add: boolean = false) {
//     return (dispatch, getState: () => ReduxState) => {
//         const state = getState();
//         // dispatch(setInspectBuildings(inspectedBuildings));
//     };
// }

//#endregion
