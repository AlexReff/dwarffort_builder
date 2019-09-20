import { DEFAULTS, IRenderTile } from "../../constants";
import { FlatReduxState } from "../store";

export const getCursorTiles = (state: FlatReduxState): IRenderTile[] => {
    if (state.cursorBuilding) {
        //if strict mode, check if terrain==floor exists at spot
        //if building, get all building tiles
        //check passability -> color
        return [{
            x: state.cursorX,
            y: state.cursorY,
            char: DEFAULTS.CURSOR.CHAR,
            color: DEFAULTS.COLORS.CURSOR_PASSABLE,
        }];
    } else {
        return [{
            x: state.cursorX,
            y: state.cursorY,
            char: DEFAULTS.CURSOR.CHAR,
            color: DEFAULTS.COLORS.CURSOR_DEFAULT,
        }];
    }
};
