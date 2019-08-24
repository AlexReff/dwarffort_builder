import { ACTION_TYPE, MENU_ITEM, Point } from "../../constants";

export interface IMenuState {
    currentMenu: string;
    currentMenuItem: MENU_ITEM;
}

const initialState = {
    currentMenu: "top",
    currentMenuItem: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.MENU_SUBMENU: {
            return {
                ...state,
                currentMenu: action.val,
                currentMenuItem: null,
            };
        }
        case ACTION_TYPE.MENU_ITEM: {
            return {
                ...state,
                currentMenuItem: action.val,
            };
        }
        case ACTION_TYPE.INSPECT_TILES: {
            return {
                ...state,
                currentMenu: "top",
                currentMenuItem: "inspect",
            };
        }
        default:
            return state;
    }
};
