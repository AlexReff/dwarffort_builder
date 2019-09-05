import { ACTION_TYPE, Point } from "../../constants/";

export function startHighlight() {
    return {
        type: ACTION_TYPE.HIGHLIGHT_START,
    };
}

export function setHighlightPos(pos: Point) {
    return {
        type: ACTION_TYPE.HIGHLIGHT_SET,
        pos,
    };
}

export function endHighlight() {
    return {
        type: ACTION_TYPE.HIGHLIGHT_END,
    };
}
