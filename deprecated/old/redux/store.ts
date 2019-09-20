import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { setBuildingListData } from "./building/actions";
import building, { IBuildingState } from "./building/reducer";
import { moveCamera, setGridSize, setMapSize, toggleAnimation, zLevelDown, zLevelGoto, zLevelUp } from "./camera/actions";
import camera, { ICameraState } from "./camera/reducer";
import { hideCursor, moveCursorRaw, setCursorBuilding, setCursorCharacter, setCursorDiameter, showCursor } from "./cursor/actions";
import cursor, { ICursorState } from "./cursor/reducer";
import { designatorEnd, designatorStart } from "./designator/actions";
import designator, { IDesignatorState } from "./designator/reducer";
import { endHighlight, setHighlightPos, startHighlight } from "./highlighter/actions";
import highlighter, { IHighlighterState } from "./highlighter/reducer";
import { inspectClear, inspectMoveSelectionRequest, inspectMoveSelectionRequestClear, inspectRequestAtMapCoord, inspectRequestAtPos, inspectRequestRange, inspectTiles } from "./inspect/actions";
import inspect, { IInspectState } from "./inspect/reducer";
import { selectMenu, selectMenuItem } from "./menu/actions";
import menu, { IMenuState } from "./menu/reducer";
import { Initialize, setStrictMode } from "./settings/actions";
import settings, { ISettingsState } from "./settings/reducer";

export const ALL_REDUCERS = {
    building,
    camera,
    cursor,
    designator,
    highlighter,
    inspect,
    menu,
    settings,
};

export const enum ACTION_TYPE {
    INITIALIZE,
    ZLEVEL_INC,
    ZLEVEL_DEC,
    ZLEVEL_GOTO,
    ANIMATION_TOGGLE,
    BUILDING_LIST_SET,
    CAMERA_GOTO,
    CAMERA_GRID_SETSIZE,
    CAMERA_MAP_SETSIZE,
    CURSOR_HIDE,
    CURSOR_SHOW,
    CURSOR_SETCHAR,
    CURSOR_SETDIAMETER,
    CURSOR_MOVE,
    CURSOR_BUILDING_START,
    CURSOR_BUILDING_END,
    DESIGNATOR_START,
    DESIGNATOR_END,
    HIGHLIGHT_START,
    HIGHLIGHT_SET,
    HIGHLIGHT_END,
    INSPECT_TILE_AT_POS,
    INSPECT_TILE_AT_MAPCOORD,
    INSPECT_TILE_CLEAR,
    INSPECT_TILES,
    INSPECT_TILERANGE,
    INSPECT_CLEAR,
    INSPECT_MOVE_SELECTION_REQUEST,
    INSPECT_MOVE_SELECTION_CLEAR,
    INSPECT_MOVE_SELECTION_FINISH,
    MENU_SUBMENU,
    MENU_ITEM,
    MOUSE_MOVE,
    MOUSE_LEFT_PRESSED,
    MOUSE_OVER_GRID,
    MOUSE_HOVER_GRID,
    STRICT_ENABLED,
    STRICT_DISABLED,
}

type NON_THUNK_ACTIONS =
    ReturnType<typeof hideCursor> |
    ReturnType<typeof showCursor> |
    ReturnType<typeof moveCursorRaw> |
    ReturnType<typeof setCursorDiameter> |
    ReturnType<typeof setCursorCharacter> |
    ReturnType<typeof setCursorBuilding> |
    ReturnType<typeof zLevelUp> |
    ReturnType<typeof zLevelDown> |
    ReturnType<typeof zLevelGoto> |
    ReturnType<typeof toggleAnimation> |
    ReturnType<typeof moveCamera> |
    ReturnType<typeof setGridSize> |
    ReturnType<typeof setMapSize> |
    ReturnType<typeof designatorStart> |
    ReturnType<typeof designatorEnd> |
    ReturnType<typeof startHighlight> |
    ReturnType<typeof setHighlightPos> |
    ReturnType<typeof endHighlight> |
    ReturnType<typeof selectMenu> |
    ReturnType<typeof selectMenuItem> |
    ReturnType<typeof setStrictMode> |
    ReturnType<typeof inspectClear> |
    ReturnType<typeof inspectRequestAtPos> |
    ReturnType<typeof inspectRequestAtMapCoord> |
    ReturnType<typeof inspectTiles> |
    ReturnType<typeof inspectRequestRange> |
    ReturnType<typeof inspectMoveSelectionRequest> |
    ReturnType<typeof inspectMoveSelectionRequestClear> |
    ReturnType<typeof setBuildingListData> |
    ReturnType<typeof Initialize>;

const COMBINED_REDUCERS = combineReducers(ALL_REDUCERS);

export type ReduxState = ReturnType<typeof COMBINED_REDUCERS>;

export type IFlatReduxState =
    IBuildingState &
    ICameraState &
    ICursorState &
    IDesignatorState &
    IHighlighterState &
    IInspectState &
    IMenuState &
    ISettingsState;

export default createStore(COMBINED_REDUCERS, applyMiddleware(thunk as ThunkMiddleware<ReduxState, NON_THUNK_ACTIONS>));

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
                                updated[prop] = _this[prop];
                            } else {
                                for (let i = 0; i < newState[cat][prop].length; i++) {
                                    if (_this[prop][i] != newState[cat][prop][i]) {
                                        updated[prop] = _this[prop].slice();
                                        break;
                                    }
                                }
                            }
                            _this[prop] = newState[cat][prop].slice();
                        } else {
                            if (_this[prop] != newState[cat][prop]) {
                                updated[prop] = _this[prop];
                            }
                            _this[prop] = newState[cat][prop];
                        }
                    } else {
                        if (_this[prop] !== null) {
                            updated[prop] = _this[prop];
                            _this[prop] = null;
                        }
                    }
                }
            }
        }
    }
    return updated;
};