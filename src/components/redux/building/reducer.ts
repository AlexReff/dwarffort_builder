import { ACTION_TYPE, IInspectTarget, Point } from "../../constants";

export interface IBuildingState {
    buildingList: { [key: number]: IInspectTarget };
    buildingTiles: { [key: string]: string };
}

const initialState: IBuildingState = {
    buildingList: {},
    buildingTiles: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.BUILDING_LIST_SET: {
            return {
                ...state,
                buildingList: action.list,
                buildingTiles: action.tiles,
            };
        }
        default:
            return state;
    }
};
