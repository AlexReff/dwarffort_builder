import { ITileCollection } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IBuildingState {
    buildingTiles: ITileCollection<IBuildingTile>;
    buildingPositions: ITileCollection<string>;
}

const initialState: IBuildingState = {
    buildingTiles: {},
    buildingPositions: {},
};

export interface IBuildingTile {
    posX: number;
    posY: number;
    posZ: number;
    key: string;
}

export default (state: IBuildingState = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_BUILDINGS: {
            state.buildingTiles = action.tiles;
            state.buildingPositions = action.positions;
            break;
        }
    }
    return state;
};
