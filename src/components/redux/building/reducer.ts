import { produce } from "immer";
import { AnyAction } from "redux";
import { ACTION_TYPE } from "../";
import { IBuildingTile } from "../../constants/";

export interface IBuildingState {
    buildingTiles: { [key: string]: { [key: string]: IBuildingTile } };
    buildingPositions: { [key: string]: { [key: string]: string } };
    buildPlaceWidth: number;
    buildPlaceHeight: number;
}

const initialState: IBuildingState = {
    buildingTiles: {},
    buildingPositions: {},
    buildPlaceWidth: 1,
    buildPlaceHeight: 1,
};

export default (state: IBuildingState = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_BUILDINGS:
        case ACTION_TYPE.MOVE_INSPECT_BUILDINGS: {
            state.buildingTiles = action.buildingTiles;
            state.buildingPositions = action.buildingPositions;
            break;
        }
        case ACTION_TYPE.SET_MENU:
        case ACTION_TYPE.SELECT_PREV_MENU: {
            state.buildPlaceWidth = 1;
            state.buildPlaceHeight = 1;
            break;
        }
        case ACTION_TYPE.PLACEBUILD_HEIGHT_DECREASE: {
            state.buildPlaceHeight = Math.max(1, state.buildPlaceHeight - action.count);
            break;
        }
        case ACTION_TYPE.PLACEBUILD_HEIGHT_INCREASE: {
            state.buildPlaceHeight += action.count;
            break;
        }
        case ACTION_TYPE.PLACEBUILD_WIDTH_DECREASE: {
            state.buildPlaceWidth = Math.max(1, state.buildPlaceWidth - action.count);
            break;
        }
        case ACTION_TYPE.PLACEBUILD_WIDTH_INCREASE: {
            state.buildPlaceWidth += action.count;
            break;
        }
        case ACTION_TYPE.DELETE_BUILDINGS: {
            if (action.cameraZ in state.buildingTiles) {
                state.buildingTiles = produce(state.buildingTiles, (draft) => {
                    for (const target of action.targets) {
                        if (target in draft[action.cameraZ]) {
                            delete draft[action.cameraZ][target];
                        }
                    }
                });
                state.buildingPositions = produce(state.buildingPositions, (draft) => {
                    for (const key of Object.keys(draft[action.cameraZ])) {
                        if (action.targets.some((m: string) => m === draft[action.cameraZ][key])) {
                            delete draft[action.cameraZ][key];
                        }
                    }
                });
            }
            break;
        }
    }
    return state;
};
