import { ITileCollection } from "src/components/constants/_interfaces";
import { MENU, MENU_ITEM } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IDiggerState {
    designateStartX: number;
    designateStartY: number;
    designateStartZ: number;
    isDesignating: boolean;
    /** KEYS: obj[cameraZ][`${x}:${y}`] */
    terrainTiles: ITileCollection<ITerrainTile>;
}

const initialState: IDiggerState = {
    designateStartX: -1,
    designateStartY: -1,
    designateStartZ: 0,
    isDesignating: false,
    terrainTiles: {},
};

export interface ITerrainTile {
    posX: number;
    posY: number;
    posZ: number;
    type: MENU_ITEM;
    characterVariant?: string;
}

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE: {
            break;
        }
        case ACTION_TYPE.DESIGNATE_START: {
            state.designateStartX = action.x;
            state.designateStartY = action.y;
            state.designateStartZ = action.z;
            state.isDesignating = true;
            break;
        }
        case ACTION_TYPE.SET_MENU: {
            const item = MENU.ITEMS[action.currentMenuItem];
            if (item) {
                state.isDesignating = state.isDesignating && item.parent === "designate";
            } else {
                state.isDesignating = false;
            }
            break;
        }
        case ACTION_TYPE.DESIGNATE_SET_TILES: {
            state.terrainTiles = action.tiles;
            state.isDesignating = false;
            break;
        }
    }
    return state;
};
