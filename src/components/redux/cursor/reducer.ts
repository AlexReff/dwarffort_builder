import { ACTION_TYPE, BUILDINGS, Point } from "../../constants";

export interface ICursorState {
    cursorVisible: boolean;
    cursorBuilding: boolean;
    cursorPosition: Point;
    cursorDiameter: number;
    cursorRadius: number;
}

const initialState: ICursorState = {
    cursorVisible: true,
    cursorBuilding: false,
    cursorPosition: [0, 0] as Point,
    cursorDiameter: 0 as number,
    cursorRadius: 0 as number,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            return {
                ...state,
                cursorPosition: action.cursorPosition,
            };
        }
        case ACTION_TYPE.MENU_SUBMENU: {
            return {
                ...state,
                cursorBuilding: false,
                cursorDiameter: 0,
            };
        }
        case ACTION_TYPE.MENU_ITEM: {
            return {
                ...state,
                cursorBuilding: action.val != null && BUILDINGS[action.val] != null,
                cursorDiameter: action.val != null && BUILDINGS[action.val] != null ? BUILDINGS[action.val].tiles.length : 0,
                cursorRadius: action.val != null && BUILDINGS[action.val] != null ? Math.floor(BUILDINGS[action.val].tiles.length / 2.0) : 0,
            };
        }
        case ACTION_TYPE.CURSOR_HIDE: {
            return {
                ...state,
                cursorVisible: false,
            };
        }
        case ACTION_TYPE.CURSOR_SHOW: {
            return {
                ...state,
                cursorVisible: true,
            };
        }
        case ACTION_TYPE.CURSOR_SETDIAMETER: {
            return {
                ...state,
                cursorDiameter: action.cursorDiameter,
                cursorRadius: action.cursorDiameter != null && action.cursorDiameter > 0 ? Math.floor(action.cursorDiameter / 2.0) : 0,
            };
        }
        case ACTION_TYPE.CURSOR_MOVE: {
            return {
                ...state,
                cursorPosition: action.pos,
            };
        }
        case ACTION_TYPE.CURSOR_BUILDING_START:
            return {
                ...state,
                cursorBuilding: true,
            };
        case ACTION_TYPE.CURSOR_BUILDING_END:
            return {
                ...state,
                cursorBuilding: false,
            };
        case ACTION_TYPE.INSPECT_TILES: {
            return {
                ...state,
                cursorVisible: action.val != null && action.val.length > 0 ? false : state.cursorVisible,
            };
        }
        default:
            return state;
    }
};
