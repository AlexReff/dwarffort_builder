import { ACTION_TYPE, Point } from "../../constants";

export interface ICursorState {
    cursorVisible: boolean;
    cursorBuilding: boolean;
    cursorPosition: Point;
    cursorRadius: number;
    buildingRange: Point[];
}

const initialState: ICursorState = {
    cursorVisible: true,
    cursorBuilding: false,
    cursorPosition: [0, 0] as Point,
    cursorRadius: 0 as number,
    buildingRange: null as Point[],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            return {
                ...state,
                cursorPosition: action.cursorPosition,
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
        case ACTION_TYPE.CURSOR_SETRADIUS: {
            return {
                ...state,
                cursorRadius: action.radius,
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
        default:
            return state;
    }
};