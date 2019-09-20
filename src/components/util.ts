import { IRenderTile } from "./constants";
import store from "./redux/store";
import Display from "./rot/display";

export const renderTile = (display: Display, tile: IRenderTile) => {
    const parms = getDisplayParms(tile);
    display.draw.apply(display, parms);
};

export const getDisplayParms = (tile: IRenderTile) => {
    const [x, y] = getGridCoord(tile.x, tile.y);
    return [
        x,
        y,
        tile.char,
        tile.color,
        "transparent",
    ];
};

export const getGridCoord = (x: number, y: number): [number, number] => {
    const state = store.getState();
    if (x < state.camera.cameraX ||
        y < state.camera.cameraY ||
        x > state.camera.cameraX + state.camera.gridWidth ||
        x > state.camera.cameraX + state.camera.gridWidth) {
            return [-1, -1];
        }
    return [
        x - state.camera.cameraX,
        y - state.camera.cameraY,
    ];
};
