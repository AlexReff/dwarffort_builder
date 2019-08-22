import { ACTION_TYPE, MENU_ITEM } from "../../constants";

export function selectMenu(val: string) {
    return {
        type: ACTION_TYPE.MENU_SUBMENU,
        val,
    };
}

export function goPrevSubmenu() {
    return (dispatch, getState) => {
        const { menu } = getState();
        let newMenu = "";
        const idx = menu.currentMenu.lastIndexOf(":");
        if (idx > 0) {
            newMenu = menu.currentMenu.substr(0, idx);
        } else {
            newMenu = "top";
        }
        dispatch(selectMenu(newMenu));
    };
}

export function selectMenuItem(val: MENU_ITEM) {
    return {
        type: ACTION_TYPE.MENU_ITEM,
        val,
    };
}
