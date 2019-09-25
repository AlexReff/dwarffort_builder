import { IBuildingState } from "./building/reducer";
import { ICameraState } from "./camera/reducer";
import { ICursorState } from "./cursor/reducer";
import { IDiggerState } from "./digger/reducer";
import { IInspectState } from "./inspect/reducer";
import { IMenuState } from "./menu/reducer";
import { ISettingsState } from "./settings/reducer";
import store, { FlatReduxState, GetFlattenedState } from "./store";

export class ReduxVariables implements FlatReduxState {
    //building
    buildingTiles: IBuildingState["buildingTiles"];
    buildingPositions: IBuildingState["buildingPositions"];
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
    cursorBuilding: ICursorState["cursorBuilding"];
    cursorX: ICursorState["cursorX"];
    cursorY: ICursorState["cursorY"];
    cursorRadius: ICursorState["cursorRadius"];
    //digger
    designateStartX: IDiggerState["designateStartX"];
    designateStartY: IDiggerState["designateStartY"];
    designateStartZ: IDiggerState["designateStartZ"];
    isDesignating: IDiggerState["isDesignating"];
    terrainTiles: IDiggerState["terrainTiles"];
    //inspect
    inspectedBuildings: IInspectState["inspectedBuildings"];
    //menu
    currentSubmenu: IMenuState["currentSubmenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    isInspecting: IMenuState["isInspecting"];
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
        GetFlattenedState(this, store);

        if (cb) {
            cb();
        }

        if (this.storeUpdated) {
            this.storeUpdated();
        }
    }
}
