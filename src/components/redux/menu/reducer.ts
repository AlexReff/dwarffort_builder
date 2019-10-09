import { AnyAction } from "redux";
import { IMenuItem, MENU_ID } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IMenuState {
    currentSubmenu: IMenuItem["id"];
    currentMenuItem: IMenuItem["id"];
}

const initialState: IMenuState = {
    currentSubmenu: MENU_ID.top,
    currentMenuItem: null,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.currentMenuItem = action.currentMenuItem;
            state.currentSubmenu = action.currentSubmenu;
            break;
        }
        case ACTION_TYPE.SET_BUILDINGS:
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.currentMenuItem = null;
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
