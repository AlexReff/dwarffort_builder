import { BUILDINGS, DEFAULTS, INPUT_STATE, IRenderTile } from "../constants";
import { FlatReduxState } from "../redux/store";
import { isBuildingPlaceable } from "../util";
import { ITileGeneratorComponent } from "./_base";

export class Cursor implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        if (state.inputState === INPUT_STATE.INSPECTING) {
            return [];
        }
        switch (state.inputState) {
            case INPUT_STATE.PLACING_BUILDING: {
                const tiles = BUILDINGS.ITEMS[state.currentMenuItem];
                if (tiles) {
                    const result = [];
                    const buildingSize = 1 + (state.cursorRadius * 2);
                    //repeat east/south as needed
                    const startX = state.cursorX - state.cursorRadius;
                    const startY = state.cursorY - state.cursorRadius;
                    const endX = state.cursorX + state.cursorRadius + (buildingSize * (state.buildPlaceWidth - 1));
                    const endY = state.cursorY + state.cursorRadius + (buildingSize * (state.buildPlaceHeight - 1));
                    for (let x = startX, ix = 0; x <= endX; x++ && ix++) {
                        for (let y = startY, iy = 0; y <= endY; y++ && iy++) {
                            const trgTile = tiles.tiles[iy % buildingSize][ix % buildingSize];
                            const color = !isBuildingPlaceable(state, x, y) ?
                                DEFAULTS.COLORS.CURSOR_INVALID :
                                trgTile.walkable === 0 ?
                                    DEFAULTS.COLORS.CURSOR_IMPASSABLE :
                                    DEFAULTS.COLORS.CURSOR_PASSABLE;
                            result.push({
                                x,
                                y,
                                char: DEFAULTS.CURSOR_CHARACTER,
                                color,
                            });
                        }
                    }
                    return result;
                }
                break;
            }
            case INPUT_STATE.DESIGNATING: {
                if (state.animationFlag) {
                    if (state.designateStartX !== -1 && state.designateStartY !== -1) {
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
                            char: DEFAULTS.CURSOR_CHARACTER,
                            color: DEFAULTS.COLORS.CURSOR_DEFAULT,
                        });
                        return result;
                    }
                }
                break;
            }
        }

        //default/fallback
        return [{
            x: state.cursorX,
            y: state.cursorY,
            char: DEFAULTS.CURSOR_CHARACTER,
            color: DEFAULTS.COLORS.CURSOR_DEFAULT,
        }];
    }
}
