import { IProduce } from "immer";
import { useDispatch, useSelector } from "react-redux";
import { Action, AnyAction, Reducer, ReducersMapObject } from "redux";
import { ALL_REDUCERS, initialStoreState, ReduxState, store } from ".";

/** Type helper for useReducer */
export type ExtractActionTypes<T> = T extends readonly any[] ? T[number] : never;

/** Type helper for Class components */
export type ReduxPropsType<T> = T extends readonly string[] ? T[number] : never;

type CombinedParamTypes<T extends { [key: string]: (state: any, action: any) => any }> = T extends { [key: string]: (state: infer R, action: any) => any } ? R : never;

export type FlatReduxState = CombinedParamTypes<typeof ALL_REDUCERS>;

/** Typed dispatch, replaces 'useDispatch' in hooks */
export const useThunkDispatch = () => useDispatch<typeof store.dispatch>();

/** Typed reducer combiner w/Immer */
export function combineReducersImmer<S, A extends Action = AnyAction>(_produce: IProduce, reducers: ReducersMapObject<S, A> = {} as ReducersMapObject): Reducer<S, A> {
    const keys = Object.keys(reducers);
    const initialState = keys.reduce((a, k) => {
        a[k] = reducers[k](undefined, {});
        return a;
    }, {});

    return _produce((draft, action) => {
        for (const key of keys) {
            draft[key] = reducers[key](draft[key], action);
        }
        return draft;
    }, initialState);
}

export function FlatGetState(_this: Record<string, any>, getState: typeof store.getState): FlatReduxState {
    const newState = getState();
    for (const reducer of Object.keys(newState)) {
        for (const prop of Object.keys(newState[reducer])) {
            _this[prop] = newState[reducer][prop];
        }
    }
    return _this as FlatReduxState;
}

export function mapStateToProps<T extends keyof FlatReduxState>(fields: readonly T[]) {
    return (state: ReduxState): Pick<FlatReduxState, T> => {
        const result = {};
        for (const reducer of Object.keys(state)) {
            for (const prop of Object.keys(state[reducer])) {
                if (fields.some((m) => m === prop)) {
                    result[prop] = state[reducer][prop];
                }
            }
        }
        return result as Pick<FlatReduxState, T>;
    };
}

export function useSelectors<T extends keyof FlatReduxState>(fields: readonly T[] | T[]): Pick<FlatReduxState, T> {
    const result: Record<string, any> = {};

    for (const reducer of Object.keys(initialStoreState).sort()) {
        for (const prop of Object.keys(initialStoreState[reducer]).sort()) {
            if (fields.some((m) => m === prop)) {
                result[prop] = useSelector((state: ReduxState) => state[reducer][prop]);
            }
        }
    }

    return result as Pick<FlatReduxState, T>;
}
