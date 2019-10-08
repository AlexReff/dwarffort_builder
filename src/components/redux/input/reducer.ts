import { AnyAction } from "redux";
import { BUILDINGS, INPUT_STATE, MENU, MENU_ITEM } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IInputState {
    inputState: INPUT_STATE;
    shiftDown: boolean;
}

const initialState: IInputState = {
    inputState: INPUT_STATE.NEUTRAL,
    shiftDown: false,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            if (action.currentMenuItem != null &&
                action.currentMenuItem !== MENU_ITEM.top) {
                if (action.currentMenuItem === MENU_ITEM.inspect) {
                    state.inputState = INPUT_STATE.INSPECTING;
                    break;
                } else if (action.currentMenuItem in BUILDINGS.ITEMS) {
                    state.inputState = INPUT_STATE.PLACING_BUILDING;
                    break;
                } else if (MENU.ITEMS[action.currentMenuItem].parent === MENU_ITEM.designate) {
                    //if the menu item is changed while designating,
                    // and the new menu item is still designating,
                    // don't change designating state
                    break;
                }
            }
            //set to neutral if no above conditions match
            state.inputState = INPUT_STATE.NEUTRAL;
            break;
        }
        case ACTION_TYPE.SET_BUILDINGS:
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.inputState = INPUT_STATE.NEUTRAL;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING:
        case ACTION_TYPE.SET_INSPECT_BUILDINGS: {
            //occurs when a building is clicked
            state.inputState = INPUT_STATE.INSPECTING;
            break;
        }
        case ACTION_TYPE.DESIGNATE_START: {
            state.inputState = INPUT_STATE.DESIGNATING;
            break;
        }
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.inputState = INPUT_STATE.NEUTRAL;
            break;
        }
        case ACTION_TYPE.SET_SHIFT_DOWN: {
            state.shiftDown = action.val;
            break;
        }
    }
    return state;
};
