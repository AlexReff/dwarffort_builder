import { BUILDINGS } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface ICursorState {
    // cursorVisible: boolean;
    cursorBuilding: boolean;
    cursorX: number;
    cursorY: number;
    cursorRadius: number;
}

const initialState: ICursorState = {
    // cursorVisible: true,
    cursorBuilding: false,
    cursorX: 0,
    cursorY: 0,
    cursorRadius: 0,
};

export default (state = initialState, action) => {
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
            if (action.currentMenuItem in BUILDINGS.IDS) {
                state.cursorBuilding = true;
            } else {
                state.cursorBuilding = false;
            }
            state.cursorRadius = action.cursorRadius;
            break;
        }
        case ACTION_TYPE.SET_BUILDINGS: {
            state.cursorBuilding = false;
            break;
        }
    }
    return state;
};
