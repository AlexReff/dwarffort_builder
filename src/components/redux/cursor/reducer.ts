import { ACTION_TYPE, NON_THUNK_ACTIONS } from "../";

export interface ICursorState {
    cursorX: number;
    cursorY: number;
    cursorRadius: number;
}

const initialState: ICursorState = {
    cursorX: 0,
    cursorY: 0,
    cursorRadius: 0,
};

export default (state = initialState, action: NON_THUNK_ACTIONS) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            state.cursorX = action.cursorX;
            state.cursorY = action.cursorY;
            break;
        }
        case ACTION_TYPE.SET_CURSOR_POS: {
            state.cursorX = action.cursorX;
            state.cursorY = action.cursorY;
            break;
        }
        case ACTION_TYPE.SET_MENU: {
            state.cursorRadius = action.cursorRadius;
            break;
        }
    }
    return state;
};
