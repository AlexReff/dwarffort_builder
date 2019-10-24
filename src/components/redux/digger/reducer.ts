import { AnyAction } from "redux";
import { ITerrainTile } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IDiggerState {
    designateStartX: number;
    designateStartY: number;
    designateStartZ: number;
    terrainTiles: { [key: string]: { [key: string]: ITerrainTile } };
}

const initialState: IDiggerState = {
    designateStartX: -1,
    designateStartY: -1,
    designateStartZ: 0,
    terrainTiles: {},
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.DESIGNATE_START: {
            state.designateStartX = action.x;
            state.designateStartY = action.y;
            state.designateStartZ = action.z;
            break;
        }
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.terrainTiles = action.tiles;
            break;
        }
    }
    return state;
};
