import { BUILDINGS, DEFAULTS, IRenderTile } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface ITerrainState {
    terrainTiles: IRenderTile[];
    // terrainData: { [key: string]: IRenderTile };
    designateStartX: number;
    designateStartY: number;
    isDesignating: boolean;
}

const initialState: ITerrainState = {
    terrainTiles: [],
    designateStartX: -1,
    designateStartY: -1,
    isDesignating: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.DESIGNATE_START: {
            state.designateStartX = action.x;
            state.designateStartY = action.y;
            break;
        }
    }
    return state;
};
