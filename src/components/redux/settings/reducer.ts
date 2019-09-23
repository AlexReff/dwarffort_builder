import { AnyAction } from "redux";
import { DEFAULTS } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface ISettingsState {
    animationFlag: boolean;
    debugMode: boolean;
    // strictMode: boolean;
}

const initialState: ISettingsState = {
    animationFlag: false,
    debugMode: false,
    // strictMode: DEFAULTS.STRICT_MODE,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.ANIMATION_TOGGLE: {
            state.animationFlag = !state.animationFlag;
            break;
        }
    }
    return state;
};
