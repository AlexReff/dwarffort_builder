import { ACTION_TYPE, Point } from "../../constants/";

export function designatorStart(pos: Point) {
    return {
        type: ACTION_TYPE.DESIGNATOR_START,
        pos,
    };
}

export function designatorEnd() {
    return {
        type: ACTION_TYPE.DESIGNATOR_END,
    };
}
