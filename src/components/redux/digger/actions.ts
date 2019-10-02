import produce from "immer";
import { FLOOR_TILES, MENU_ITEM } from "../../constants";
import rng from "../../rot/rng";
import { getMapCoord, getNeighborsOfRange } from "../../util";
import { ACTION_TYPE, FlatGetState, FlatReduxState } from "../store";
import { IDiggerState } from "./reducer";

//#region REDUX ACTIONS

export function setDesignateStart(x: number, y: number, z: number) {
    return {
        type: ACTION_TYPE.DESIGNATE_START,
        x,
        y,
        z,
    };
}

export function setDigData(tiles: IDiggerState["terrainTiles"]) {
    return {
        type: ACTION_TYPE.DESIGNATE_SET_TILES,
        tiles,
    };
}

//#endregion
//#region THUNK ACTIONS

export function submitDesignating() {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        if (!state.isDesignating) {
            return;
        }
        const tiles = produce(state.terrainTiles, (draft) => {
            let startZ = state.cameraZ;
            let endZ = state.cameraZ;
            if (state.cameraZ !== state.designateStartZ) {
                //range of z levels
                startZ = Math.min(+state.cameraZ, +state.designateStartZ);
                endZ = Math.max(+state.cameraZ, +state.designateStartZ);
            }
            const startX = Math.min(state.designateStartX, state.cursorX);
            const endX = Math.max(state.designateStartX, state.cursorX);
            const startY = Math.min(state.designateStartY, state.cursorY);
            const endY = Math.max(state.designateStartY, state.cursorY);
            for (let z = startZ; z <= endZ; z++) {
                if (!(z in draft)) {
                    draft[z] = {};
                }
                for (let y = startY; y <= endY; y++) {
                    for (let x = startX; x <= endX; x++) {
                        const key = `${x}:${y}`;
                        if (z in state.buildingPositions) {
                            if (key in state.buildingPositions[z]) {
                                continue; //do not modify tiles under buildings
                            }
                        }
                        switch (state.currentMenuItem) {
                            case MENU_ITEM.remove:
                                if (key in draft[z]) {
                                    delete draft[z][key];
                                }
                                break;
                            // case MENU_ITEM.wall:
                            //     draft[z][key] = {
                            //         posX: x,
                            //         posY: y,
                            //         posZ: z,
                            //         type: MENU_ITEM.wall,
                            //         userSet: true,
                            //     };
                            //     break;
                            case MENU_ITEM.mine:
                                draft[z][key] = {
                                    posX: x,
                                    posY: y,
                                    posZ: z,
                                    type: MENU_ITEM.mine,
                                    characterVariant: rng.getUniformInt(0, FLOOR_TILES.length - 1).toString(),
                                    userSet: true,
                                };
                                break;
                        }
                    }
                }
                if (state.currentMenuItem === MENU_ITEM.mine) {
                    //create walls around designated area (if empty)
                    const points = getNeighborsOfRange(startX, startY, endX, endY, state);
                    for (const point of points) {
                        const key = `${point[0]}:${point[1]}`;
                        if (!(key in draft[z])) {
                            draft[z][key] = {
                                posX: point[0],
                                posY: point[1],
                                posZ: z,
                                type: MENU_ITEM.wall,
                                userSet: false,
                            };
                        }
                    }
                }
                // //populate wall variant on this z-level
                // for (let y = 0; y < state.mapHeight; y++) {
                //     for (let x = 0; x < state.mapWidth; x++) {
                //         const key = `${x}:${y}`;
                //         if (key in draft[z]) {
                //             if (draft[z][key].type === MENU_ITEM.wall) {
                //                 draft[z][key].characterVariant = getNeighborFlags(draft, state, x, y, z);
                //             }
                //         }
                //     }
                // }
            }
        });
        dispatch(setDigData(tiles));
    };
}

export function startDesignatingGrid(gridX: number, gridY: number) {
    return (dispatch, getState) => {
        const state = FlatGetState({}, getState);
        const [x, y] = getMapCoord(gridX, gridY, state);
        dispatch(setDesignateStart(x, y, state.cameraZ));
    };
}

//#endregion

//#region Helper functions

//#endregion
