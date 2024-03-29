import produce from "immer";
import { ACTION_TYPE, IDiggerState, store } from "../";
import { FLOOR_TILES, INPUT_STATE, MENU_ID } from "../../constants";
import rng from "../../rot/rng";
import { getMapCoord } from "../../util";
import { FlatGetState } from "../helpers";

//#region REDUX ACTIONS

export function setDesignateStart(x: number, y: number, z: number) {
    return {
        type: ACTION_TYPE.DESIGNATE_START as const,
        x,
        y,
        z,
    };
}

export function setDigData(tiles: IDiggerState["terrainTiles"]) {
    return {
        type: ACTION_TYPE.DESIGNATE_SET_TILES as const,
        tiles,
    };
}

//#endregion
//#region THUNK ACTIONS

export function submitDesignating() {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = getState();
        if (state.input.inputState !== INPUT_STATE.DESIGNATING) {
            return;
        }

        const cameraZ = state.camera.cameraZ;
        const startX = Math.min(state.digger.designateStartX, state.cursor.cursorX);
        const endX = Math.max(state.digger.designateStartX, state.cursor.cursorX);
        const startY = Math.min(state.digger.designateStartY, state.cursor.cursorY);
        const endY = Math.max(state.digger.designateStartY, state.cursor.cursorY);

        const tiles = produce(state.digger.terrainTiles, (draft) => {
            let startZ = cameraZ;
            let endZ = cameraZ;
            if (cameraZ !== state.digger.designateStartZ) {
                //range of z levels
                startZ = Math.min(+cameraZ, +state.digger.designateStartZ);
                endZ = Math.max(+cameraZ, +state.digger.designateStartZ);
            }
            for (let z = startZ; z <= endZ; z++) {
                if (!(z in draft)) {
                    draft[z] = {};
                }
                for (let y = startY; y <= endY; y++) {
                    for (let x = startX; x <= endX; x++) {
                        const key = `${x}:${y}`;
                        if (z in state.building.buildingPositions) {
                            if (key in state.building.buildingPositions[z]) {
                                continue; //do not modify tiles under buildings
                            }
                        }
                        switch (state.menu.currentMenuItem) {
                            case MENU_ID.remove:
                                if (key in draft[z]) {
                                    delete draft[z][key];
                                }
                                break;
                            case MENU_ID.mine:
                                draft[z][key] = {
                                    posX: x,
                                    posY: y,
                                    posZ: z,
                                    type: MENU_ID.mine,
                                    characterVariant: rng.getUniformInt(0, FLOOR_TILES.length - 1).toString(),
                                    userSet: true,
                                };
                                break;
                            case MENU_ID.upstair:
                            case MENU_ID.downstair:
                            case MENU_ID.udstair:
                            case MENU_ID.channel:
                            case MENU_ID.upramp:
                                draft[z][key] = {
                                    posX: x,
                                    posY: y,
                                    posZ: z,
                                    type: state.menu.currentMenuItem,
                                    userSet: true,
                                };
                                break;
                        }
                    }
                }
                // if (state.menu.currentMenuItem === MENU_ID.mine) {
                //     //create walls around designated area (if empty)
                //     const points = getNeighborsOfRange(startX, startY, endX, endY, state);
                //     for (const point of points) {
                //         const key = `${point[0]}:${point[1]}`;
                //         if (!(key in draft[z])) {
                //             draft[z][key] = {
                //                 posX: point[0],
                //                 posY: point[1],
                //                 posZ: z,
                //                 type: MENU_ID.wall,
                //                 userSet: false,
                //             };
                //         }
                //     }
                // }
            }
        });
        dispatch(setDigData(tiles));
    };
}

export function startDesignatingGrid(gridX: number, gridY: number) {
    return (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
        const state = FlatGetState({}, getState);
        const [x, y] = getMapCoord(gridX, gridY, state);
        dispatch(setDesignateStart(x, y, state.cameraZ));
    };
}

//#endregion
