import { ACTION_TYPE, IInspectTarget, Point } from "../../constants";

export interface IInspectState {
    coordToInspect: Point;
    coordRangeToInspect: [Point, Point];
    mapCoordToInspect: string;
    inspecting: boolean;
    inspectedBuildings: IInspectTarget[]; //list of building names currently selected
}

const initialState: IInspectState = {
    coordToInspect: null,
    coordRangeToInspect: null,
    mapCoordToInspect: null,
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
                coordRangeToInspect: null,
                mapCoordToInspect: null,
            };
        }
        case ACTION_TYPE.INSPECT_TILE_AT_POS: {
            return {
                ...state,
                coordToInspect: action.val,
            };
        }
        case ACTION_TYPE.INSPECT_TILE_AT_MAPCOORD: {
            return {
                ...state,
                mapCoordToInspect: action.coord,
            };
        }
        case ACTION_TYPE.INSPECT_TILERANGE: {
            return {
                ...state,
                coordRangeToInspect: [action.first, action.second],
            };
        }
        case ACTION_TYPE.INSPECT_CLEAR: {
            return {
                ...state,
                coordToInspect: null,
                coordRangeToInspect: null,
                inspectedBuildings: null,
                mapCoordToInspect: null,
            };
        }
        case ACTION_TYPE.INSPECT_TILES: {
            return {
                ...state,
                inspectedBuildings: action.val,
                coordToInspect: null,
                coordRangeToInspect: null,
                mapCoordToInspect: null,
            };
        }
        default:
            return state;
    }
};
