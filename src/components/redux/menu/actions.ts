import { BUILDINGS, MENU } from "../../constants";
import { ACTION_TYPE, FlatGetState } from "../store";
import { IMenuState } from "./reducer";

//#region REDUX ACTIONS

export function _setMenus(currentSubmenu, currentMenuItem, cursorRadius) {
    return {
        type: ACTION_TYPE.SET_MENU,
        currentSubmenu,
        currentMenuItem,
        cursorRadius,
    };
}

//#endregion
//#region THUNK ACTIONS

export function selectMenus(currentSubmenu, currentMenuItem) {
    return (dispatch, getState) => {
        // const state = FlatGetState({}, getState);
        let cursorRange = 0;
        if (currentMenuItem in BUILDINGS.ITEMS) {
            const tiles = BUILDINGS.ITEMS[currentMenuItem];
            if (tiles) {
                cursorRange = Math.floor(tiles.tiles.length / 2.0);
            }
        }
        dispatch(_setMenus(currentSubmenu, currentMenuItem, cursorRange));
    };
}

export function selectMenu(val: IMenuState["currentSubmenu"]) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (val == null) { //deselect highlighted menu item
            state.currentMenuItem = null;
        } else if (val === "top") { //go to top menu
            state.currentSubmenu = "top";
            state.currentMenuItem = null;
        } else if (val in MENU.SUBMENUS) { //change submenu
            state.currentSubmenu = val;
            state.currentMenuItem = null;
        } else { //highlight menu item
            state.currentMenuItem = val;
        }
        dispatch(selectMenus(state.currentSubmenu, state.currentMenuItem));
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
        dispatch(selectMenus(state.currentSubmenu, state.currentMenuItem));
    };
}

//#endregion
