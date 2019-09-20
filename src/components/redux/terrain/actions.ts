import { ACTION_TYPE, FlatGetState } from "../store";

export function startDesignating(x: number, y: number) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        return {
            type: ACTION_TYPE.DESIGNATE_START,
            x,
            y,
        };
    };
}
