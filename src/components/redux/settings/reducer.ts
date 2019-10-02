import { AnyAction } from "redux";
import { ACTION_TYPE } from "../store";

export interface ISettingsState {
    animationFlag: boolean;
    debugMode: boolean;
}

const initialState: ISettingsState = {
    animationFlag: false,
    debugMode: false,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.ANIMATION_TOGGLE: {
            state.animationFlag = !state.animationFlag;
            break;
        }
        case ACTION_TYPE.DEBUG_TOGGLE: {
            state.debugMode = !state.debugMode;
            break;
        }
    }
    return state;
};
