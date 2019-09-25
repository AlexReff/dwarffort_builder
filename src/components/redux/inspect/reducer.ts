import { AnyAction } from "redux";
import { MENU_ITEM } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface IInspectState {
    inspectedBuildings: string[];
}

const initialState: IInspectState = {
    inspectedBuildings: [],
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.inspectedBuildings = [];
            break;
        }
        case ACTION_TYPE.SET_INSPECT_BUILDINGS: {
            state.inspectedBuildings = action.items;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING: {
            state.inspectedBuildings.push(action.item);
            break;
        }
        case ACTION_TYPE.REMOVE_INSPECT_BUILDING: {
            const idx = state.inspectedBuildings.indexOf(action.item);
            if (idx > 0) {
                delete state.inspectedBuildings[idx];
            }
            break;
        }
        case ACTION_TYPE.SET_ZLEVEL: {
            state.inspectedBuildings = [];
        }
    }
    return state;
};
