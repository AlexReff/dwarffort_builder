import { CURSOR_BEHAVIOR, DEFAULTS, Point } from "../../../components/constantsnts/constants";
import { ACTION_TYPE } from "../store";

export interface ISettingsState {
    strictMode: boolean;
    cursorMode: CURSOR_BEHAVIOR;
}

const initialState: ISettingsState = {
    strictMode: DEFAULTS.STRICT_MODE,
    cursorMode: DEFAULTS.CURSOR.MODE,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.STRICT_ENABLED: {
            return {
                ...state,
                strictMode: true,
            };
        }
        case ACTION_TYPE.STRICT_DISABLED: {
            return {
                ...state,
                strictMode: false,
            };
        }
        default:
            return state;
    }
};
