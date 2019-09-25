import { AnyAction } from "redux";
import { IMenuItem, MENU_ITEM } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IMenuState {
    currentSubmenu: IMenuItem["id"];
    currentMenuItem: MENU_ITEM;
    isInspecting: boolean;
}

const initialState: IMenuState = {
    currentSubmenu: "top",
    currentMenuItem: null,
    isInspecting: false,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.currentMenuItem = action.currentMenuItem;
            state.currentSubmenu = action.currentSubmenu;
            state.isInspecting = action.currentMenuItem === MENU_ITEM.inspect;
            break;
        }
        case ACTION_TYPE.SET_BUILDINGS:
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.currentMenuItem = null;
            state.isInspecting = false;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING:
        case ACTION_TYPE.SET_INSPECT_BUILDINGS: {
            //occurs when a building is clicked
            state.currentMenuItem = MENU_ITEM.inspect;
            state.currentSubmenu = "top";
            state.isInspecting = true;
        }
    }
    return state;
};
