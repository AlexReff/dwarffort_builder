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
            break;
        }
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.currentMenuItem = null;
            break;
        }
    }
    return state;
};
