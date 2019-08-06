import { ACTION_TYPE, MENU_ITEM, Point } from "../../constants";

export interface IMenuState {
    currentMenu: string;
    currentMenuItem: MENU_ITEM;
    inspecting: boolean;
}

const initialState = {
    currentMenu: "top",
    currentMenuItem: null,
    inspecting: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.MENU_SUBMENU: {
            return {
                ...state,
                currentMenu: action.val,
                currentMenuItem: null,
                inspecting: false,
            };
        }
        case ACTION_TYPE.MENU_ITEM: {
            return {
                ...state,
                currentMenuItem: action.val,
                inspecting: action.val != null && action.val === "inspect",
            };
        }
        default:
            return state;
    }
};
