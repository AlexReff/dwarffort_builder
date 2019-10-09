import { IProduce, produce as createNextState } from "immer";
import { Action, AnyAction, applyMiddleware, createStore, Reducer, ReducersMapObject } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { deleteBuildings, setBuildings } from "./building/actions";
import building from "./building/reducer";
import { setCameraPos, setCameraZ, setMapSize } from "./camera/actions";
import camera from "./camera/reducer";
import { setCursorPos } from "./cursor/actions";
import cursor from "./cursor/reducer";
import { setDesignateStart, setDigData } from "./digger/actions";
import digger from "./digger/reducer";
import { setShiftDown } from "./input/actions";
import input from "./input/reducer";
import { _moveInspectedBuildings, addInspectBuilding, removeInspectBuilding, setInspectBuildings } from "./inspect/actions";
import inspect from "./inspect/reducer";
import { _setMenus } from "./menu/actions";
import menu from "./menu/reducer";
import { Initialize, toggleAnimation } from "./settings/actions";
import settings from "./settings/reducer";

export const ALL_REDUCERS = {
    building,
    camera,
    cursor,
    digger,
    input,
    inspect,
    menu,
    settings,
};

export const enum ACTION_TYPE {
    INITIALIZE,
    SET_MENU,
    SELECT_PREV_MENU,
    SET_CAMERA_POS,
    SET_CURSOR_POS,
    SET_MAP_SIZE,
    SET_ZLEVEL,
    DESIGNATE_START,
    ANIMATION_TOGGLE,
    DESIGNATE_SET_TILES,
    SET_BUILDINGS,
    DELETE_BUILDINGS,
    SET_INSPECT_BUILDINGS,
    ADD_INSPECT_BUILDING,
    SET_GRID_BOUNDS,
    REMOVE_INSPECT_BUILDING,
    MOVE_INSPECT_BUILDINGS,
    DEBUG_TOGGLE,
    PLACEBUILD_WIDTH_INCREASE,
    PLACEBUILD_HEIGHT_INCREASE,
    PLACEBUILD_WIDTH_DECREASE,
    PLACEBUILD_HEIGHT_DECREASE,
    ADD_INSPECT_BUILDINGS,
    SET_SHIFT_DOWN,
}

function combineReducersImmer<S, A extends Action = AnyAction>(produce: IProduce, reducers: ReducersMapObject<S, A> = {} as ReducersMapObject): Reducer<S, A> {
    const keys = Object.keys(reducers);
    const initialState = keys.reduce((a, k) => {
        a[k] = reducers[k](undefined, {});
        return a;
    }, {});

    return produce((draft, action) => {
        for (const key of keys) {
            draft[key] = reducers[key](draft[key], action);
        }
        return draft;
    }, initialState);
}

const COMBINED_REDUCERS = combineReducersImmer(createNextState, ALL_REDUCERS);

export type ReduxState = ReturnType<typeof COMBINED_REDUCERS>;

type CombinedParamTypes<T extends Record<string, (state: any, action: any) => any>> = T extends Record<string, (state: infer R, action: any) => any> ? R : never;

type CombinedReturnTypes<T extends Record<string, (state: any, action: any) => any>> = T extends Record<string, (state: any, action: any) => infer R> ? R : never;

export type FlatReduxState = CombinedParamTypes<typeof ALL_REDUCERS>;

type NON_THUNK_ACTIONS =
    //builder
    ReturnType<typeof setBuildings> |
    ReturnType<typeof deleteBuildings> |
    //camera
    ReturnType<typeof setMapSize> |
    ReturnType<typeof setCameraPos> |
    ReturnType<typeof setCameraZ> |
    //cursor
    ReturnType<typeof setCursorPos> |
    //digger
    ReturnType<typeof setDesignateStart> |
    ReturnType<typeof setDigData> |
    //input
    ReturnType<typeof setShiftDown> |
    //inspect
    ReturnType<typeof setInspectBuildings> |
    ReturnType<typeof addInspectBuilding> |
    ReturnType<typeof removeInspectBuilding> |
    ReturnType<typeof _moveInspectedBuildings> |
    //menu
    ReturnType<typeof _setMenus> |
    //settings
    ReturnType<typeof toggleAnimation> |
    ReturnType<typeof Initialize>;

const store = createStore(COMBINED_REDUCERS, applyMiddleware(thunk as ThunkMiddleware<ReduxState, NON_THUNK_ACTIONS>));

export function FlatGetState(_this: Partial<FlatReduxState>, getState: typeof store.getState): FlatReduxState {
    const newState = getState();
    for (const reducer of Object.keys(newState)) {
        for (const prop of Object.keys(newState[reducer])) {
            _this[prop] = newState[reducer][prop];
        }
    }
    return _this as FlatReduxState;
}

export default store;
