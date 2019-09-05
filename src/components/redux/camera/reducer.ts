import { ACTION_TYPE, Point } from "../../constants/";

export interface ICameraState {
    animationToggle: boolean;
    zLevel: number;
    camera: Point;
    gridSize: Point;
    mapSize: Point;
}

const initialState: ICameraState = {
    animationToggle: false,
    zLevel: 0,
    camera: [0, 0] as Point,
    gridSize: null as Point,
    mapSize: null as Point,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            return {
                ...state,
                gridSize: action.gridSize,
                mapSize: action.mapSize,
                camera: action.camera,
            };
        }
        case ACTION_TYPE.ANIMATION_TOGGLE: {
            return {
                ...state,
                animationToggle: !state.animationToggle,
            };
        }
        case ACTION_TYPE.ZLEVEL_INC: {
            return {
                ...state,
                zLevel: state.zLevel + 1,
            };
        }
        case ACTION_TYPE.ZLEVEL_DEC: {
            return {
                ...state,
                zLevel: state.zLevel - 1,
            };
        }
        case ACTION_TYPE.ZLEVEL_GOTO: {
            return {
                ...state,
                zLevel: action.level,
            };
        }
        case ACTION_TYPE.CAMERA_GOTO: {
            return {
                ...state,
                camera: action.coord,
            };
        }
        case ACTION_TYPE.CAMERA_GRID_SETSIZE: {
            return {
                ...state,
                size: action.size,
            };
        }
        case ACTION_TYPE.CAMERA_MAP_SETSIZE: {
            return {
                ...state,
                size: action.size,
            };
        }
        default:
            return state;
    }
};
