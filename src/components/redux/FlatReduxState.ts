import { IBuildingState } from "./building/reducer";
import { ICameraState } from "./camera/reducer";
import { ICursorState } from "./cursor/reducer";
import { IDiggerState } from "./digger/reducer";
import { IInspectState } from "./inspect/reducer";
import { IMenuState } from "./menu/reducer";
import { ISettingsState } from "./settings/reducer";
import store, { FlatReduxState, FlatGetState } from "./store";
import { IInputState } from "./input/reducer";

export class ReduxVariables implements FlatReduxState {
    //building
    buildingTiles: IBuildingState["buildingTiles"];
    buildingPositions: IBuildingState["buildingPositions"];
    buildPlaceWidth: IBuildingState["buildPlaceWidth"];
    buildPlaceHeight: IBuildingState["buildPlaceHeight"];
    //camera
    gridHeight: ICameraState["gridHeight"];
    decoratorTiles: ICameraState["decoratorTiles"];
    gridWidth: ICameraState["gridWidth"];
    mapHeight: ICameraState["mapHeight"];
    mapWidth: ICameraState["mapWidth"];
    cameraX: ICameraState["cameraX"];
    cameraY: ICameraState["cameraY"];
    cameraZ: ICameraState["cameraZ"];
    gridBounds: ICameraState["gridBounds"];
    //cursor
    cursorX: ICursorState["cursorX"];
    cursorY: ICursorState["cursorY"];
    cursorRadius: ICursorState["cursorRadius"];
    //digger
    designateStartX: IDiggerState["designateStartX"];
    designateStartY: IDiggerState["designateStartY"];
    designateStartZ: IDiggerState["designateStartZ"];
    terrainTiles: IDiggerState["terrainTiles"];
    //input
    inputState: IInputState["inputState"];
    shiftDown: IInputState["shiftDown"];
    //inspect
    inspectedBuildings: IInspectState["inspectedBuildings"];
    //menu
    currentSubmenu: IMenuState["currentSubmenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    //settings
    animationFlag: ISettingsState["animationFlag"];
    debugMode: ISettingsState["debugMode"];
}

export abstract class GameComponent extends ReduxVariables {
    /** Called once after the initial store data has loaded for the first time */
    abstract dataLoaded: () => any;
    /** Called after a store update occurs */
    abstract storeUpdated: () => any;
    storeHasData: boolean;

    constructor() {
        super();
        this.storeHasData = false;
    }

    init = () => {
        store.subscribe(this.getStoreData);
        this.getStoreData(this.dataLoaded);
    }

    getStoreData = (cb?: (...args: any) => any) => {
        this.storeHasData = true;
        FlatGetState(this, store.getState);

        if (cb) {
            cb();
        }

        if (this.storeUpdated) {
            this.storeUpdated();
        }
    }
}
