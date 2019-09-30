import { original } from "immer";
import { AnyAction } from "redux";
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
        case ACTION_TYPE.MOVE_INSPECT_BUILDINGS: {
            state.inspectedBuildings = action.inspectedBuildings;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING: {
            state.inspectedBuildings.push(action.item);
            break;
        }
        case ACTION_TYPE.REMOVE_INSPECT_BUILDING: {
            // state.inspectedBuildings = state.inspectedBuildings.filter((m) => m !== action.item);
            // original;
            //use .splice
            const idx = (original(state.inspectedBuildings) as string[]).indexOf(action.item);
            if (idx >= 0) {
                // delete state.inspectedBuildings[idx];
                state.inspectedBuildings.splice(idx, 1);
            }
            break;
        }
        case ACTION_TYPE.SET_ZLEVEL: {
            state.inspectedBuildings = [];
        }
    }
    return state;
};
