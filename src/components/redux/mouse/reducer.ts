import { ACTION_TYPE, Point } from "../../constants";
import { Tile } from "../../game/tile";

export interface IMouseState {
    mouseOverGrid: boolean;
    leftMouseDown: boolean;
    mouseMapCoord: Point;
    mouseTile: Tile;
}

const initialState: IMouseState = {
    // mouseLeft: -1,
    // mouseTop: -1,
    mouseOverGrid: false,
    leftMouseDown: false,
    mouseMapCoord: null,
    mouseTile: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.MOUSE_LEFT_PRESSED: {
            return {
                ...state,
                leftMouseDown: action.val,
            };
        }
        // case ACTION_TYPE.MOUSE_MOVE: {
        //     return {
        //         ...state,
        //         mouseLeft: action.pos[0],
        //         mouseTop: action.pos[1],
        //     };
        // }
        case ACTION_TYPE.MOUSE_OVER_GRID: {
            return {
                ...state,
                mouseOverGrid: action.val,
                mouseMapCoord: !!action.val ? state.mouseMapCoord : null,
            };
        }
        case ACTION_TYPE.MOUSE_HOVER_GRID: {
            return {
                ...state,
                mouseMapCoord: action.pos,
            };
        }
        default:
            return state;
    }
};
