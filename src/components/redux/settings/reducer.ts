import { AnyAction } from "redux";
import { DEFAULTS } from "../../constants";
import { ACTION_TYPE } from "../store";

export interface ISettingsState {
    // canvasRef: HTMLCanvasElement;
    debugMode: boolean;
    strictMode: boolean;
}

const initialState: ISettingsState = {
    // canvasRef: null,
    debugMode: false,
    strictMode: DEFAULTS.STRICT_MODE,
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case ACTION_TYPE.INITIALIZE:
            //
            break;
    }
    return state;
};
