import { MENU, MENU_ITEM } from "../../../components/constantsnts/constants";
import { ACTION_TYPE } from "../store";

export function selectMenu(val: string) {
    return {
        type: ACTION_TYPE.MENU_SUBMENU,
        val,
    };
}

export function goPrevSubmenu() {
    return (dispatch, getState) => {
        const { menu } = getState();
        // let newMenu = "";
        // const idx = menu.currentMenu.lastIndexOf(":");
        // if (idx > 0) {
        //     newMenu = menu.currentMenu.substr(0, idx);
        // } else {
        //     newMenu = "top";
        // }
        if (menu.currentMenu in MENU.ITEMS) {
            dispatch(selectMenu(MENU.ITEMS[menu.currentMenu].parent));
        }
    };
}

export function selectMenuItem(val: MENU_ITEM) {
    return {
        type: ACTION_TYPE.MENU_ITEM,
        val,
    };
}
