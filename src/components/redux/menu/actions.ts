import { MENU } from "../../constants";
import { ACTION_TYPE, FlatGetState } from "../store";
import { IMenuState } from "./reducer";

export function selectMenu(val: IMenuState["currentSubmenu"]) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        let currentMenuItem = state.currentMenuItem;
        let currentSubmenu = state.currentSubmenu;
        if (val == null) { //deselect highlighted menu item
            currentMenuItem = null;
        } else if (val === "top") { //go to top menu
            currentSubmenu = "top";
            currentMenuItem = null;
        } else if (val in MENU.SUBMENUS) { //change submenu
            currentSubmenu = val;
            currentMenuItem = null;
        } else { //highlight menu item
            currentMenuItem = val;
        }
        dispatch(setMenus(currentSubmenu, currentMenuItem));
    };
}

export function selectPrevSubmenu() {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (state.currentMenuItem != null) {
            state.currentMenuItem = null;
        } else if (state.currentSubmenu !== "top") {
            const key = MENU.ITEMS[state.currentSubmenu].parsedKey;
            const idx = key.lastIndexOf(":");
            if (idx > -1) {
                const newMenuKey = key.substr(0, idx);
                if (newMenuKey in MENU.KEYS) {
                    state.currentSubmenu = MENU.KEYS[newMenuKey].id;
                }
            } else {
                state.currentSubmenu = "top";
            }
        }
        dispatch(setMenus(state.currentSubmenu, state.currentMenuItem));
    };
}

export function setMenus(currentSubmenu, currentMenuItem) {
    return {
        type: ACTION_TYPE.SET_MENU,
        currentSubmenu,
        currentMenuItem,
    };
}
