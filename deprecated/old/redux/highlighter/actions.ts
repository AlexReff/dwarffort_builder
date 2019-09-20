import { Point } from "../../../components/constantsnts/constants";
import { ACTION_TYPE } from "../store";

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
