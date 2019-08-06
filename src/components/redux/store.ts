import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import camera, { ICameraState } from "./camera/reducer";
import cursor, { ICursorState } from "./cursor/reducer";
import designator, { IDesignatorState } from "./designator/reducer";
import highlighter, { IHighlighterState } from "./highlighter/reducer";
import menu, { IMenuState } from "./menu/reducer";
import mouse, { IMouseState } from "./mouse/reducer";
import settings, { ISettingsState } from "./settings/reducer";

export const ALL_REDUCERS = {
    camera,
    cursor,
    designator,
    highlighter,
    menu,
    mouse,
    settings,
};

const COMBINED_REDUCERS = combineReducers(ALL_REDUCERS);

export default createStore(COMBINED_REDUCERS, applyMiddleware(thunk));

export type ReduxState = ReturnType<typeof COMBINED_REDUCERS>;

type IFlatReduxState = ICameraState & ICursorState & IDesignatorState & IHighlighterState & IMenuState & IMouseState & ISettingsState;

/** Updates the redux variables & returns {true} if an update has occured */
export const getAllStoreData = (_this: Partial<IFlatReduxState>, store: any): boolean => {
    const newState: ReduxState = store.getState();
    let updated = false;
    for (const cat in newState) {
        if (newState.hasOwnProperty(cat)) {
            for (const prop in newState[cat]) {
                if (newState[cat].hasOwnProperty(prop) && _this.hasOwnProperty(prop)) {
                    if (newState[cat][prop] != null) {
                        if (newState[cat][prop] instanceof Array) {
                            if (_this[prop] == null ||
                                !(_this[prop] instanceof Array) ||
                                _this[prop].length !== newState[cat][prop].length) {
                                updated = true;
                            } else {
                                for (let i = 0; i < newState[cat][prop].length; i++) {
                                    if (_this[prop][i] != newState[cat][prop][i]) {
                                        updated = true;
                                        break;
                                    }
                                }
                            }
                            _this[prop] = newState[cat][prop].slice();
                        } else {
                            if (_this[prop] != newState[cat][prop]) {
                                updated = true;
                            }
                            _this[prop] = newState[cat][prop];
                        }
                    } else {
                        _this[prop] = null;
                    }
                }
            }
        }
    }
    return updated;
};

/** Updates redux variables & returns an object containing previous values of updated fields */
export const getUpdatedStoreData = (_this: Partial<IFlatReduxState>, store: any): Partial<IFlatReduxState> => {
    const newState: ReduxState = store.getState();
    const updated = {};
    for (const cat in newState) {
        if (newState.hasOwnProperty(cat)) {
            for (const prop in newState[cat]) {
                if (newState[cat].hasOwnProperty(prop) && _this.hasOwnProperty(prop)) {
                    if (newState[cat][prop] != null) {
                        if (newState[cat][prop] instanceof Array) {
                            if (_this[prop] == null ||
                                !(_this[prop] instanceof Array) ||
                                _this[prop].length !== newState[cat][prop].length) {
                                // updated = true;
                                updated[prop] = _this[prop];
                            } else {
                                for (let i = 0; i < newState[cat][prop].length; i++) {
                                    if (_this[prop][i] != newState[cat][prop][i]) {
                                        // updated = true;
                                        updated[prop] = _this[prop].slice();
                                        break;
                                    }
                                }
                            }
                            _this[prop] = newState[cat][prop].slice();
                        } else {
                            if (_this[prop] != newState[cat][prop]) {
                                // updated = true;
                                updated[prop] = _this[prop];
                            }
                            _this[prop] = newState[cat][prop];
                        }
                    } else {
                        if (_this[prop] !== null) {
                            updated[prop] = _this[prop];
                        } else {
                            _this[prop] = null;
                        }
                    }
                }
            }
        }
    }
    return updated;
};
