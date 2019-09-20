import { ACTION_TYPE } from "../store";
import { IBuildingState } from "./reducer";

export function setBuildingListData(
    list: IBuildingState["buildingList"],
    tiles: IBuildingState["buildingTiles"],
    ids: IBuildingState["buildingIds"],
    bounds: IBuildingState["buildingBounds"],
    ) {
    return {
        type: ACTION_TYPE.BUILDING_LIST_SET,
        list,
        tiles,
        ids,
        bounds,
    };
}
