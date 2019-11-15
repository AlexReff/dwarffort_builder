import { produce } from "immer";
import { applyMiddleware, createStore } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { NON_THUNK_ACTIONS } from "./";
import building from "./building/reducer";
import camera from "./camera/reducer";
import cursor from "./cursor/reducer";
import digger from "./digger/reducer";
import { combineReducersImmer } from "./helpers";
import input from "./input/reducer";
import inspect from "./inspect/reducer";
import menu from "./menu/reducer";
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

const COMBINED_REDUCERS = combineReducersImmer(produce, ALL_REDUCERS);

export type ReduxState = ReturnType<typeof COMBINED_REDUCERS>;

export const store = createStore(
    COMBINED_REDUCERS,
    applyMiddleware(thunk as ThunkMiddleware<ReduxState, NON_THUNK_ACTIONS>),
);

export const initialStoreState = store.getState();
