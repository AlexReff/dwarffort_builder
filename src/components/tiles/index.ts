import { FlatReduxState } from "../redux";

export { getBuilderTiles } from "./builder";
export { getCursorTiles } from "./cursor";
export { getDecoratorTiles } from "./decorator";
export { getDiggerTiles } from "./digger";

export type RenderTileState = Pick<FlatReduxState,
    "inputState" |
    "currentMenuItem" |
    "cursorRadius" |
    "cursorX" |
    "cursorY" |
    "buildPlaceWidth" |
    "buildPlaceHeight" |
    "animationFlag" |
    "designateStartX" |
    "designateStartY" |
    "cameraZ" |
    "terrainTiles" |
    "buildingPositions" |
    "buildingTiles" |
    "mapHeight" |
    "mapWidth" |
    "cameraX" |
    "cameraY" |
    "gridHeight" |
    "gridWidth"
>;
