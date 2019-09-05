import { ACTION_TYPE, Point } from "../../constants/";

export interface IHighlighterState {
    highlighting: boolean;
    highlightingStart: Point;
}

const initialState: IHighlighterState = {
    highlighting: false,
    highlightingStart: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.HIGHLIGHT_START: {
            return {
                ...state,
                highlighting: true,
            };
        }
        case ACTION_TYPE.HIGHLIGHT_SET: {
            return {
                ...state,
                highlightingStart: action.pos,
            };
        }
        case ACTION_TYPE.HIGHLIGHT_END: {
            return {
                ...state,
                highlighting: false,
                highlightingStart: null,
            };
        }
        default:
            return state;
    }
};
