import { AnyAction } from "redux";
import { ACTION_TYPE } from "../store";

export interface IInspectState {
    inspectedBuildings: string[];
    highlightedBuildings: string[];
}

const initialState: IInspectState = {
    inspectedBuildings: [],
    highlightedBuildings: [],
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MENU: {
            state.inspectedBuildings = [];
            break;
        }
        case ACTION_TYPE.SET_INSPECT_BUILDINGS:
        case ACTION_TYPE.MOVE_INSPECT_BUILDINGS: {
            state.inspectedBuildings = action.inspectedBuildings;
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDING: {
            state.inspectedBuildings.push(action.item);
            break;
        }
        case ACTION_TYPE.ADD_INSPECT_BUILDINGS: {
            state.inspectedBuildings.concat(action.items);
            break;
        }
        case ACTION_TYPE.REMOVE_INSPECT_BUILDING: {
            const idx = state.inspectedBuildings.indexOf(action.item);
            if (idx >= 0) {
                state.inspectedBuildings.splice(idx, 1);
            }
            break;
        }
        case ACTION_TYPE.SET_ZLEVEL: {
            state.inspectedBuildings = [];
            break;
        }
        case ACTION_TYPE.DELETE_BUILDINGS: {
            state.inspectedBuildings = state.inspectedBuildings.filter((val) => {
                return !action.targets.some((m: string) => m === val);
            });
            break;
        }
        case ACTION_TYPE.HIGHLIGHT_BUILDINGS: {
            state.highlightedBuildings = action.items;
            break;
        }
        case ACTION_TYPE.HIGHLIGHT_BUILDINGS_CLEAR: {
            state.highlightedBuildings = [];
            break;
        }
    }
    return state;
};
