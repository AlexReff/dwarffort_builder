import { ACTION_TYPE, Point } from "../../constants";

export interface IBuildingState {
    /** a list of building KEYS: `zLevel:x:y` */
    buildingList: string[];
    /** the map bounds of the building */
    buildingBounds: { [key: number]: [Point, Point] };
    /** key: all tiles that have a building | value: buildingList::key */
    buildingTiles: { [key: string]: string };
    /** buildingList::key to BUILDINGS::key mapping */
    buildingIds: { [key: string]: string };
}

const initialState: IBuildingState = {
    buildingList: [],
    buildingBounds: {},
    buildingTiles: {},
    buildingIds: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.BUILDING_LIST_SET: {
            return {
                ...state,
                buildingList: [...action.list],
                buildingTiles: {...action.tiles},
                buildingIds: {...action.ids},
                buildingBounds: {...action.bounds},
            };
        }
        default:
            return state;
    }
};
