import { ACTION_TYPE, NON_THUNK_ACTIONS } from "../";

export interface IInspectState {
    inspectedBuildings: string[];
    highlightedBuildings: string[];
}

const initialState: IInspectState = {
    inspectedBuildings: [],
    highlightedBuildings: [],
};

export default (state = initialState, action: NON_THUNK_ACTIONS) => {
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
        case ACTION_TYPE.REMOVE_INSPECT_BUILDINGS: {
            state.inspectedBuildings = state.inspectedBuildings.filter((m) => !action.items.some((n: string) => n === m));
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
