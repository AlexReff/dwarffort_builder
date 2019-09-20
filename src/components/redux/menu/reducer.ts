import { AnyAction } from "redux";
import { IMenuItem, MENU_ITEM } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IMenuState {
    currentSubmenu: IMenuItem["id"];
    currentMenuItem: MENU_ITEM;
}

const initialState: IMenuState = {
    currentSubmenu: "top",
    currentMenuItem: null,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.currentMenuItem = action.currentMenuItem;
            state.currentSubmenu = action.currentSubmenu;
            break;
        }
    }
    return state;
};
