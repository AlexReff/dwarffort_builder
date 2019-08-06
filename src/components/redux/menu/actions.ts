import { ACTION_TYPE, MENU_ITEM } from "../../constants";

export function goToSubmenu(val: string) {
    return {
        type: ACTION_TYPE.MENU_SUBMENU,
        val,
    };
}

export function selectMenuItem(val: MENU_ITEM) {
    return {
        type: ACTION_TYPE.MENU_ITEM,
        val,
    };
}
