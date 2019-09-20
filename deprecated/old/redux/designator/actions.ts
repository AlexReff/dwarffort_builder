import { Point } from "../../../components/constantsnts/constants";
import { ACTION_TYPE } from "../store";

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
