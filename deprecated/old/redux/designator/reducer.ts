import { Point } from "../../../components/constantsnts/constants";
import { ACTION_TYPE } from "../store";

export interface IDesignatorState {
    isDesignating: boolean;
    designatorStart: Point;
}

const initialState: IDesignatorState = {
    isDesignating: false,
    designatorStart: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTION_TYPE.DESIGNATOR_START: {
            return {
                ...state,
                isDesignating: true,
                designatorStart: action.pos,
            };
        }
        case ACTION_TYPE.DESIGNATOR_END: {
            return {
                ...state,
                isDesignating: false,
                designatorStart: null,
            };
        }
        default:
            return state;
    }
};
