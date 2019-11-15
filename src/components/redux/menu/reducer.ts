import { ACTION_TYPE, NON_THUNK_ACTIONS } from "../";
import { IMenuItem, MENU_ID } from "../../constants";

export interface IMenuState {
    currentSubmenu: IMenuItem["id"];
    currentMenuItem: IMenuItem["id"];
}

const initialState: IMenuState = {
    currentSubmenu: MENU_ID.top,
    currentMenuItem: null,
};

export default (state = initialState, action: NON_THUNK_ACTIONS) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.currentMenuItem = action.currentMenuItem;
            state.currentSubmenu = action.currentSubmenu;
            break;
        }
        case ACTION_TYPE.SET_BUILDINGS:
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            // state.currentMenuItem = null;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING:
        case ACTION_TYPE.SET_INSPECT_BUILDINGS: {
            //occurs when a building is clicked
            state.currentMenuItem = MENU_ID.inspect;
            state.currentSubmenu = MENU_ID.top;
            break;
        }
    }
    return state;
};
