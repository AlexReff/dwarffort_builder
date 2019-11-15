import { ACTION_TYPE, NON_THUNK_ACTIONS } from "../";
import { IRenderTile } from "../../constants";

export interface ICameraState {
    gridHeight: number;
    gridWidth: number;
    mapHeight: number;
    mapWidth: number;
    cameraX: number;
    cameraY: number;
    cameraZ: number;
    decoratorTiles: IRenderTile[];
    gridBounds: ReturnType<HTMLElement["getBoundingClientRect"]>;
}

const initialState: ICameraState = {
    gridHeight: 0,
    gridWidth: 0,
    mapHeight: 0,
    mapWidth: 0,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    decoratorTiles: [],
    gridBounds: null,
};

export default (state: ICameraState = initialState, action: NON_THUNK_ACTIONS) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            state.gridHeight = action.gridHeight;
            state.gridWidth = action.gridWidth;
            state.mapHeight = action.mapHeight;
            state.mapWidth = action.mapWidth;
            state.cameraX = action.cameraX;
            state.cameraY = action.cameraY;
            state.gridBounds = action.gridBounds;
            break;
        }
        case ACTION_TYPE.SET_MAP_SIZE: {
            state.mapWidth = action.mapWidth;
            state.mapHeight = action.mapHeight;
            state.gridWidth = action.gridWidth;
            state.gridHeight = action.gridHeight;
            break;
        }
        case ACTION_TYPE.SET_CAMERA_POS: {
            state.cameraX = action.x;
            state.cameraY = action.y;
            break;
        }
        case ACTION_TYPE.SET_ZLEVEL: {
            state.cameraZ = action.z;
            break;
        }
    }
    return state;
};
