import { IRenderTile } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IBuildingState {
    buildingTiles: IRenderTile[];
    // gridHeight: number;
    // gridWidth: number;
    // mapHeight: number;
    // mapWidth: number;
    // cameraX: number;
    // cameraY: number;
    // cameraZ: number;
}

const initialState: IBuildingState = {
    buildingTiles: [],
    // gridHeight: 0,
    // gridWidth: 0,
    // mapHeight: 0,
    // mapWidth: 0,
    // cameraX: 0,
    // cameraY: 0,
    // cameraZ: 0,
};

export default (state: IBuildingState = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            // state.gridHeight = action.gridHeight;
            // state.gridWidth = action.gridWidth;
            // state.mapHeight = action.mapHeight;
            // state.mapWidth = action.mapWidth;
            // state.cameraX = action.cameraX;
            // state.cameraY = action.cameraY;
            break;
        }
    }
    return state;
};
