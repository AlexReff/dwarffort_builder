import { ACTION_TYPE } from "../../constants";
import { IBuildingState } from "./reducer";

export function setBuildingListData(list: IBuildingState["buildingList"], tiles: IBuildingState["buildingTiles"]) {
    return {
        type: ACTION_TYPE.INSPECT_TILERANGE,
        list,
        tiles,
    };
}
