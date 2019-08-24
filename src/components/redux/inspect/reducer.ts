import { ACTION_TYPE, Point } from "../../constants";

export interface IInspectState {
    addCoord: boolean;
    coordToInspect: Point;
    coordRangeToInspect: [Point, Point];
    mapCoordToInspect: string;
    inspecting: boolean;
    inspectedBuildings: string[]; //list of building names currently selected
}

const initialState: IInspectState = {
    addCoord: false,
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
                inspectedBuildings: [],
            };
        }
        case ACTION_TYPE.MENU_ITEM: {
            return {
                ...state,
                inspecting: action.val != null && action.val === "inspect",
                inspectedBuildings: action.val == null || action.val !== "inspect" ? state.inspectedBuildings : [],
            };
        }
        case ACTION_TYPE.INSPECT_TILE_AT_POS: {
            return {
                ...state,
                coordToInspect: action.val,
                addCoord: action.add,
            };
        }
        case ACTION_TYPE.INSPECT_TILE_AT_MAPCOORD: {
            return {
                ...state,
                mapCoordToInspect: action.coord,
                addCoord: action.add,
            };
        }
        case ACTION_TYPE.INSPECT_TILERANGE: {
            return {
                ...state,
                coordRangeToInspect: [action.first, action.second],
                addCoord: action.add,
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
                inspectedBuildings: [...action.val],
                coordToInspect: null,
                coordRangeToInspect: null,
                mapCoordToInspect: null,
                inspecting: true,
            };
        }
        default:
            return state;
    }
};
