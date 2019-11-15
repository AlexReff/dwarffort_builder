import { ACTION_TYPE, NON_THUNK_ACTIONS } from "../";

export interface ISettingsState {
    animationFlag: boolean;
}

const initialState: ISettingsState = {
    animationFlag: false,
};

export default (state = initialState, action: NON_THUNK_ACTIONS) => {
    switch (action.type) {
        case ACTION_TYPE.ANIMATION_TOGGLE: {
            state.animationFlag = !state.animationFlag;
            break;
        }
    }
    return state;
};
