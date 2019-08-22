import { ACTION_TYPE, Point } from "../../constants";

export interface IInspectState {
    coordToInspect: Point;
    inspecting: boolean;
    inspectedBuildings: string[]; //list of building names currently selected
}

const initialState: IInspectState = {
    coordToInspect: null,
    inspecting: false,
    inspectedBuildings: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.MENU_SUBMENU: {
            return {
                ...state,
                inspecting: false,
            };
        }
        case ACTION_TYPE.MENU_ITEM: {
            return {
                ...state,
                inspecting: action.val != null && action.val === "inspect",
            };
        }
        case ACTION_TYPE.INSPECT_TILE_CLEAR: {
            return {
                ...state,
                coordToInspect: null,
            };
        }
        case ACTION_TYPE.INSPECT_TILE_AT_POS: {
            return {
                ...state,
                coordToInspect: action.val,
            };
        }
        case ACTION_TYPE.INSPECT_TILERANGE: {
            return {
                ...state,
            };
        }
        case ACTION_TYPE.INSPECT_CLEAR: {
            return {
                ...state,
                coordToInspect: null,
                inspectedBuildings: null,
            };
        }
        case ACTION_TYPE.INSPECT_TILES: {
            return {
                ...state,
                inspectedBuildings: action.val,
                coordToInspect: null,
            };
        }
        default:
            return state;
    }
};
