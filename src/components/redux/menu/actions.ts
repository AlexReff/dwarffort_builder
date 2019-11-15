import { ACTION_TYPE, FlatGetState, store } from "../";
import { BUILDINGS, MENU, MENU_ID } from "../../constants";
import { IMenuState } from "./reducer";

//#region REDUX ACTIONS

export function _setMenus(currentSubmenu: MENU_ID, currentMenuItem: MENU_ID) {
    let cursorRadius = 0;
    if (currentMenuItem in BUILDINGS.ITEMS) {
        const tiles = BUILDINGS.ITEMS[currentMenuItem];
        if (tiles && tiles.tiles) {
            cursorRadius = Math.floor(tiles.tiles.length / 2.0);
        }
    }
    return {
        type: ACTION_TYPE.SET_MENU as const,
        currentSubmenu,
        currentMenuItem,
        cursorRadius,
    };
}

//#endregion
//#region THUNK ACTIONS

export function selectMenu(val: IMenuState["currentSubmenu"]) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        let currentMenuItem = state.currentMenuItem;
        let currentSubmenu = state.currentSubmenu;
        if (val == null) { //deselect highlighted menu item
            currentMenuItem = null;
        } else if (val === MENU_ID.top) { //go to top menu
            currentSubmenu = MENU_ID.top;
            currentMenuItem = null;
        } else if (val in MENU.SUBMENUS) { //change submenu
            currentSubmenu = val;
            currentMenuItem = null;
        } else { //highlight menu item
            currentMenuItem = val;
        }
        dispatch(_setMenus(currentSubmenu, currentMenuItem));
    };
}

export function selectPrevSubmenu() {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        if (state.currentMenuItem != null) {
            state.currentMenuItem = null;
        } else if (state.currentSubmenu !== MENU_ID.top) {
            const key = MENU.ITEMS[state.currentSubmenu].parsedKey;
            const idx = key.lastIndexOf(":");
            if (idx > -1) {
                const newMenuKey = key.substr(0, idx);
                if (newMenuKey in MENU.KEYS) {
                    state.currentSubmenu = MENU.KEYS[newMenuKey].id;
                }
            } else {
                state.currentSubmenu = MENU_ID.top;
            }
        }
        dispatch(_setMenus(state.currentSubmenu, state.currentMenuItem));
    };
}

//#endregion
