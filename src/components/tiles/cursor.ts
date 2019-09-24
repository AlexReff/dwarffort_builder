import { BUILDINGS, DEFAULTS, IRenderTile } from "../constants";
import { FlatReduxState } from "../redux/store";
import { isBuildingPlaceable } from "../util";
import { ITileGeneratorComponent } from "./_base";

export class Cursor implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        if (state.cursorBuilding) {
            const tiles = BUILDINGS.IDS[state.currentMenuItem];
            if (tiles) {
                const result = [];
                const range = state.cursorRadius;
                const startX = state.cursorX - range;
                const startY = state.cursorY - range;
                const endX = state.cursorX + range;
                const endY = state.cursorY + range;
                for (let x = startX, ix = 0; x <= endX; x++ && ix++) {
                    for (let y = startY, iy = 0; y <= endY; y++ && iy++) {
                        const trgTile = tiles.tiles[iy][ix];
                        const color = !isBuildingPlaceable(state, x, y) ?
                            DEFAULTS.COLORS.CURSOR_INVALID :
                            trgTile.walkable === 0 ?
                                DEFAULTS.COLORS.CURSOR_IMPASSABLE :
                                DEFAULTS.COLORS.CURSOR_PASSABLE;
                        result.push({
                            x,
                            y,
                            char: DEFAULTS.CURSOR.CHAR,
                            color,
                        });
                    }
                }
                return result;
            }
        } else if (state.isDesignating) {
            if (state.animationFlag) {
                //do not draw
            } else if (state.designateStartX !== -1 && state.designateStartY !== -1) {
                const result = [];
                const startX = Math.min(state.designateStartX, state.cursorX);
                const startY = Math.min(state.designateStartY, state.cursorY);
                const endX = Math.max(state.designateStartX, state.cursorX);
                const endY = Math.max(state.designateStartY, state.cursorY);
                for (let x = startX; x <= endX; x++) {
                    for (let y = startY; y <= endY; y++) {
                        let color = DEFAULTS.COLORS.DESIGNATE_RANGE;
                        if (x === state.designateStartX && y === state.designateStartY) {
                            color = DEFAULTS.COLORS.DESIGNATE_START;
                        }
                        result.push({
                            x,
                            y,
                            char: ",",
                            color,
                        });
                    }
                }
                result.push({
                    x: state.cursorX,
                    y: state.cursorY,
                    char: DEFAULTS.CURSOR.CHAR,
                    color: DEFAULTS.COLORS.CURSOR_DEFAULT,
                });
                return result;
            }
        }

        //default/fallback
        return [{
            x: state.cursorX,
            y: state.cursorY,
            char: DEFAULTS.CURSOR.CHAR,
            color: DEFAULTS.COLORS.CURSOR_DEFAULT,
        }];
    }
}
