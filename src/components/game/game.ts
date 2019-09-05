// import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import store, { getUpdatedStoreData, IFlatReduxState } from "../redux/store";
import { default as Display } from "../rot/display";

import { BUILDINGS, DEFAULTS, DIRECTION, IGridRange, KEYS, MENU_ITEM, Point, TILE_H, TILE_MAP, TILE_W } from "../constants/";
import { setBuildingListData } from "../redux/building/actions";
import { IBuildingState } from "../redux/building/reducer";
import { zLevelGoto } from "../redux/camera/actions";
import { ICameraState } from "../redux/camera/reducer";
import { moveCursor } from "../redux/cursor/actions";
import { ICursorState } from "../redux/cursor/reducer";
import { designatorEnd, designatorStart } from "../redux/designator/actions";
import { IDesignatorState } from "../redux/designator/reducer";
import { IHighlighterState } from "../redux/highlighter/reducer";
import { inspectClear, inspectMoveSelectionRequestClear, inspectMoveSelectionRequestFinish, inspectTiles } from "../redux/inspect/actions";
import { IInspectState } from "../redux/inspect/reducer";
import { goPrevSubmenu, selectMenuItem } from "../redux/menu/actions";
import { IMenuState } from "../redux/menu/reducer";
import { Initialize } from "../redux/settings/actions";
import { ISettingsState } from "../redux/settings/reducer";
import rng from "../rot/rng";
import { Tile, TILETYPE } from "./tile";

class Game implements IFlatReduxState {
    displayElement: HTMLElement;
    canvasRef: any;
    display: Display;
    tileSheetImage: HTMLImageElement;
    gameGrid: { [key: number]: Tile[][] };
    noiseMaps: { [key: number]: OpenSimplexNoise };
    initRan: boolean;
    animationToggle: boolean;
    animationInterval: number;
    mouseOverGrid: boolean;
    leftMouseDown: boolean;
    mouseMapCoord: [number, number];
    mouseTile: Tile;

    //redux
    buildingList: IBuildingState["buildingList"] = null;
    /** All tiles that have a building, key=coord, val=buildingList::Key */
    buildingTiles: IBuildingState["buildingTiles"] = null;
    buildingBounds: IBuildingState["buildingBounds"] = null;
    buildingIds: IBuildingState["buildingIds"] = null;
    gridSize: ICameraState["gridSize"] = null; //size of the rendered game grid [width, height]
    mapSize: ICameraState["mapSize"] = null; //size of the full map (including non-rendered portions)
    camera: ICameraState["camera"] = null;
    zLevel: ICameraState["zLevel"] = null;
    cursorPosition: ICursorState["cursorPosition"] = null;
    cursorDiameter: ICursorState["cursorDiameter"] = null;
    cursorRadius: ICursorState["cursorRadius"] = null;
    cursorVisible: ICursorState["cursorVisible"] = null;
    cursorBuilding: ICursorState["cursorBuilding"] = null;
    isDesignating: IDesignatorState["isDesignating"] = null;
    designatorStart: IDesignatorState["designatorStart"] = null;
    highlighting: IHighlighterState["highlighting"] = null;
    highlightingStart: IHighlighterState["highlightingStart"] = null;
    addCoord: IInspectState["addCoord"] = null;
    coordToInspect: IInspectState["coordToInspect"] = null;
    coordRangeToInspect: IInspectState["coordRangeToInspect"] = null;
    inspecting: IInspectState["inspecting"] = null;
    inspectedBuildings: IInspectState["inspectedBuildings"] = null;
    inspectMoveRequestPayload: IInspectState["inspectMoveRequestPayload"] = null;
    mapCoordToInspect: IInspectState["mapCoordToInspect"] = null;
    currentMenu: IMenuState["currentMenu"] = null;
    currentMenuItem: IMenuState["currentMenuItem"] = null;
    strictMode: ISettingsState["strictMode"] = null;
    cursorMode: ISettingsState["cursorMode"] = null;

    //#region init
    constructor(image: HTMLImageElement, container: HTMLElement, canvas: any) {
        this.initRan = false;
        this.animationToggle = false;
        this.tileSheetImage = image;
        this.gameGrid = {};
        this.noiseMaps = {};
        this.strictMode = DEFAULTS.STRICT_MODE;
        this.canvasRef = canvas;
        this.zLevel = 0;

        this.gridSize = [
            container.offsetWidth / TILE_W,
            container.offsetHeight / TILE_H,
        ];

        this.mapSize = [
            Math.max(DEFAULTS.MAP_MIN_W, this.gridSize[0]),
            Math.max(DEFAULTS.MAP_MIN_H, this.gridSize[1]),
        ];

        this.camera = [
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
            Math.floor((this.mapSize[1] - this.gridSize[1]) / 2),
        ];

        this.cursorPosition = [
            Math.ceil((this.camera[0] + this.gridSize[0]) / 2.0),
            Math.ceil((this.camera[1] + this.gridSize[1]) / 2.0),
        ];

        store.dispatch(Initialize(this.gridSize, this.mapSize, this.camera, this.cursorPosition));
        store.subscribe(this.getStoreData);

        document.addEventListener("keydown", this.handleKeyPress);
        this.animationInterval = window.setInterval(() => (this.handleAnimToggle()), 250);

        this.init();
    }

    getStoreData = () => {
        const oldData = getUpdatedStoreData(this, store);

        if (oldData.zLevel != null) {
            this.populateFloor(this.zLevel);
        }

        this.handleInspectRequests(oldData);

        this.handleInspectMoveRequests(oldData);

        if (this.initRan && this.display != null) {
            this.render();
        }
    }

    init = (container?: HTMLElement) => {
        if (container) {
            this.gridSize = [
                container.offsetWidth / TILE_W,
                container.offsetHeight / TILE_H,
            ];

            this.mapSize = [
                Math.max(DEFAULTS.MAP_MIN_W, this.gridSize[0]),
                Math.max(DEFAULTS.MAP_MIN_H, this.gridSize[1]),
            ];

            this.camera = [
                Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
                Math.floor((this.mapSize[1] - this.gridSize[1]) / 2),
            ];

            this.cursorPosition = [
                Math.ceil((this.camera[0] + this.gridSize[0]) / 2.0),
                Math.ceil((this.camera[1] + this.gridSize[1]) / 2.0),
            ];

            store.dispatch(Initialize(this.gridSize, this.mapSize, this.camera, this.cursorPosition));
        }

        this.display = new Display({
            canvasElement: this.canvasRef,
            width: this.gridSize[0],
            height: this.gridSize[1],
            layout: Display.TileGL.isSupported ? "tile-gl" : "tile",
            tileWidth: TILE_W,
            tileHeight: TILE_H,
            tileSet: this.tileSheetImage,
            tileMap: TILE_MAP,
            tileColorize: true,
            bg: "transparent",
        });

        this.populateFloor();

        this.displayElement = this.display.getContainer();

        this.displayElement.addEventListener("contextmenu", this.handleContextMenu);
        this.displayElement.addEventListener("mousedown", this.handleGridClick);

        this.render();
        this.initRan = true;
    }

    destroy = () => {
        this.displayElement.removeEventListener("contextmenu", this.handleContextMenu);
        this.displayElement.removeEventListener("mousedown", this.handleGridClick);
        this.displayElement = null;
        this.display = null;
    }
    //#endregion init

    //#region handlers
    handleAnimToggle = () => {
        this.animationToggle = !this.animationToggle;
        if (this.display != null) {
            this.render();
        }
    }

    inspectBuildings = (newTiles: string[]) => {
        let result = newTiles.splice(0);
        if (this.addCoord) {
            if (this.inspectedBuildings != null && this.inspectedBuildings.length > 0) {
                const removeCoords = this.inspectedBuildings.filter((m) => result.some((n) => n === m));
                result = this.inspectedBuildings.concat(result).filter((m) => !removeCoords.some((n) => n === m));
                //result = this.inspectedBuildings.concat(newTiles.filter((m) => !this.inspectedBuildings.some((n) => n === m)));
            }
        }
        store.dispatch(inspectTiles(result));
    }

    handleInspectRequests = (oldData: Partial<IFlatReduxState>) => {
        // an inspect request at the given screen coordinates
        if (typeof oldData.coordToInspect !== "undefined" &&
            this.coordToInspect != null &&
            this.coordToInspect.length === 2) {
            const gridPos = this.display.eventToPosition({ clientX: this.coordToInspect[0], clientY: this.coordToInspect[1] });
            const pos = this.getMapCoord(gridPos);
            const bldgKey = `${this.zLevel}:${pos[0]}:${pos[1]}`;
            if (bldgKey in this.buildingTiles) {
                this.inspectBuildings([this.buildingTiles[bldgKey]]);
                return;
            } else {
                this.inspectBuildings([]);
            }
        }

        // an inspect request for a specific item (map coord)
        if (typeof oldData.mapCoordToInspect !== "undefined" &&
            this.mapCoordToInspect != null &&
            this.mapCoordToInspect.length > 0) {
            const bldgKey2 = `${this.zLevel}:${this.mapCoordToInspect[0]}:${this.mapCoordToInspect[1]}`;
            if (bldgKey2 in this.buildingTiles) {
                this.inspectBuildings([this.buildingTiles[bldgKey2]]);
                return;
            }
        }

        // an inspect request over a range of screen coordinates
        if (typeof oldData.coordRangeToInspect !== "undefined" &&
            this.coordRangeToInspect != null &&
            this.coordRangeToInspect.length === 2 &&
            this.coordRangeToInspect[0] != null &&
            this.coordRangeToInspect[1] != null &&
            this.coordRangeToInspect[0].length === 2 &&
            this.coordRangeToInspect[1].length === 2) {

            const first = this.display.eventToPosition({ clientX: this.coordRangeToInspect[0][0], clientY: this.coordRangeToInspect[0][1] });
            const second = this.display.eventToPosition({ clientX: this.coordRangeToInspect[1][0], clientY: this.coordRangeToInspect[1][1] });

            if (first != null && second != null) {
                const mFirst = this.getMapCoord(first);
                const mSecond = this.getMapCoord(second);
                const xStart = Math.min(mFirst[0], mSecond[0]);
                const yStart = Math.min(mFirst[1], mSecond[1]);
                const xEnd = Math.max(mFirst[0], mSecond[0]);
                const yEnd = Math.max(mFirst[1], mSecond[1]);

                const tileKeys = new Set<string>();
                for (let x = xStart; x <= xEnd; x++) {
                    for (let y = yStart; y <= yEnd; y++) {
                        const thisKey = `${this.zLevel}:${x}:${y}`;
                        if (thisKey in this.buildingTiles) {
                            tileKeys.add(this.buildingTiles[thisKey]);
                        }
                    }
                }

                const newTiles = Array.from<string>(tileKeys);
                this.inspectBuildings(newTiles);
                return;
            }
        }
    }

    handleInspectMoveRequests = (oldData: Partial<IFlatReduxState>) => {
        if (typeof oldData.inspectMoveRequestPayload === "undefined" ||
            this.inspectMoveRequestPayload == null ||
            this.inspectedBuildings == null ||
            this.inspectedBuildings.length === 0) {
            return;
        }

        const xGridDiff = Math.floor(this.inspectMoveRequestPayload.diffX / +TILE_W);
        const yGridDiff = Math.floor(this.inspectMoveRequestPayload.diffY / +TILE_H);

        if (xGridDiff === 0 && yGridDiff === 0) {
            store.dispatch(inspectMoveSelectionRequestClear());
            return;
        }

        const inspectTilePile = [];
        for (const key of this.inspectedBuildings) {
            for (const tile of Object.keys(this.buildingTiles)) {
                if (this.buildingTiles[tile] === key) {
                    inspectTilePile.push([tile, key]);
                }
            }
        }

        //check move validity
        const shiftedTilePile = [];
        for (const tile of inspectTilePile) {
            //tile[0] = tilePos, tile[1] = centerKey
            //`${zLevel}:${x}:${y}`;
            const parts = tile[0].split(":");
            const newPos = `${parts[0]}:${+parts[1] + xGridDiff}:${+parts[2] + yGridDiff}`;
            shiftedTilePile.push(newPos);
            if (newPos in this.buildingTiles) {
                if (!inspectTilePile.some((m) => m[0] === newPos) && //not inspected
                    this.buildingTiles[newPos] !== tile[1]) { //in our way!
                    return false; //can't complete this move
                }
            }
            if (!this.gameGrid[parts[0]][parts[1]][parts[2]].isBuildable(this.strictMode)) {
                return false;
            }
        }

        //clear tiles from gameGrid and store the building data
        const oldBuildings: { [key: string]: string } = {};
        for (const tile of inspectTilePile) {
            const parts = tile[0].split(":");
            const target = this.gameGrid[parts[0]][parts[1]][parts[2]];
            oldBuildings[tile[0]] = target.getBuildingKey();
            const targetType = this.strictMode ? TILETYPE.Floor : TILETYPE.Empty;
            target.setType(targetType, false);
        }

        //remove this building from list
        this.buildingList = this.buildingList.filter((m) => {
            return !Object.keys(oldBuildings).some((n) => m === n);
        });

        //remove old tiles for moved building
        this.buildingTiles = Object.keys(this.buildingTiles).reduce((map, mapKey) => {
            if (!this.inspectedBuildings.includes(this.buildingTiles[mapKey])) {
                map[mapKey] = this.buildingTiles[mapKey];
            }
            return map;
        }, {});

        const oldBuildingIds = {};
        const newBuildingIds = {};
        for (const key of Object.keys(this.buildingIds)) {
            if (this.inspectedBuildings.includes(key)) {
                oldBuildingIds[key] = this.buildingIds[key];
            } else {
                newBuildingIds[key] = this.buildingIds[key];
            }
        }

        this.buildingIds = newBuildingIds;

        const newBuildingBounds = {};
        for (const key of Object.keys(this.buildingBounds)) {
            if (!this.inspectedBuildings.includes(key)) {
                newBuildingBounds[key] = this.buildingBounds[key];
            }
        }

        this.buildingBounds = newBuildingBounds;

        this.inspectedBuildings = this.inspectedBuildings.map((m) => {
            const parts = m.split(":");
            const newPos = `${parts[0]}:${+parts[1] + xGridDiff}:${+parts[2] + yGridDiff}`;
            return newPos;
        });

        store.dispatch(inspectMoveSelectionRequestFinish(this.inspectedBuildings, this.buildingList, this.buildingTiles, this.buildingIds, this.buildingBounds));

        for (const key of Object.keys(oldBuildingIds)) {
            const parts = key.split(":");
            this.tryPlaceBuilding(oldBuildingIds[key], [+parts[1] + xGridDiff, +parts[2] + yGridDiff]);
        }
    }

    //left click
    handleGridClick = (e: MouseEvent | TouchEvent) => {
        if (e instanceof MouseEvent && e.button !== 0) {
            return;
        }
        e.preventDefault();

        if (this.inspecting) {
            //handle inspection / click+drag highlighter
        } else {
            const gridPos = this.display.eventToPosition(e);
            const pos = this.getMapCoord(gridPos);
            this.moveCursorTo(pos);
        }
    }

    //right click
    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (this.inspecting) {
            //
        } else {
            const gridPos = this.display.eventToPosition(e);
            const mapPos = this.getMapCoord(gridPos);
            this.cursorPosition = mapPos.slice() as Point;
            this.moveCursorTo(mapPos);
            this.handleEnterRightClick();
        }
    }

    handleEnterRightClick = () => {
        if (this.inspecting) {
            //right-click inspect building/item
        } else {
            if (this.currentMenuItem == null) {
                return;
            }
            if (this.cursorBuilding) {
                if (this.tryPlaceBuildingAtCursor()) {
                    store.dispatch(selectMenuItem(null));
                }
            } else {
                if (this.isDesignating) {
                    this.designateRange();
                    store.dispatch(designatorEnd());
                } else {
                    store.dispatch(designatorStart(this.cursorPosition));
                }
            }
        }
    }

    cancelDesignate = () => {
        store.dispatch(designatorEnd());
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return; //don't override ctrl+btn browser hotkeys
        }
        switch (e.keyCode) {
            case KEYS.VK_ESCAPE:
                e.preventDefault();
                if (this.inspecting) {
                    if (this.inspectedBuildings != null) {
                        store.dispatch(inspectClear());
                    } else {
                        store.dispatch(selectMenuItem(null));
                    }
                } else if (this.isDesignating) {
                    this.cancelDesignate();
                } else if (this.currentMenuItem != null) {
                    store.dispatch(selectMenuItem(null));
                } else {
                    // go up one menu level
                    store.dispatch(goPrevSubmenu());
                }
                break;
            case KEYS.VK_RETURN:
                e.preventDefault();
                this.handleEnterRightClick();
                break;
            case KEYS.VK_UP:
            case KEYS.VK_NUMPAD8:
                //move north
                e.preventDefault();
                this.moveCursor(DIRECTION.N, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_PAGE_UP:
            case KEYS.VK_NUMPAD9:
                //move ne
                e.preventDefault();
                this.moveCursor(DIRECTION.NE, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_NUMPAD6:
                //move east
                e.preventDefault();
                this.moveCursor(DIRECTION.E, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_PAGE_DOWN:
            case KEYS.VK_NUMPAD3:
                //move se
                e.preventDefault();
                this.moveCursor(DIRECTION.SE, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_NUMPAD2:
                //move south
                e.preventDefault();
                this.moveCursor(DIRECTION.S, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_END:
            case KEYS.VK_NUMPAD1:
                //move sw
                e.preventDefault();
                this.moveCursor(DIRECTION.SW, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_NUMPAD4:
                //move west
                e.preventDefault();
                this.moveCursor(DIRECTION.W, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_HOME:
            case KEYS.VK_NUMPAD7:
                //move nw
                e.preventDefault();
                this.moveCursor(DIRECTION.NW, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_PERIOD:
            case KEYS.VK_GREATER_THAN:
                this.zUp();
                break;
            case KEYS.VK_COMMA:
            case KEYS.VK_LESS_THAN:
                this.zDown();
                break;
            default:
                break;
        }
    }
    //#endregion handlers

    //#region floors&neighbors
    zUp = (): number => {
        //go up one z level
        return this.goToZLevel(this.zLevel + 1);
    }

    zDown = (): number => {
        //go down one z level
        return this.goToZLevel(this.zLevel - 1);
    }

    goToZLevel = (level: number) => {
        //this.zLevel = level;
        store.dispatch(zLevelGoto(level));
        return level;
    }

    populateAllFloors = () => {
        for (const floor of Object.keys(this.gameGrid)) {
            this.populateFloor(Number(floor));
        }
    }

    populateFloor = (floor?: number) => {
        const targetFloor = floor || this.zLevel;
        if (this.noiseMaps[this.zLevel] == null) {
            this.noiseMaps[this.zLevel] = new OpenSimplexNoise(Date.now() * rng.getUniform());
        }
        const noiseMap = this.noiseMaps[this.zLevel].array2D(this.mapSize[0], this.mapSize[1]).map((e) => {
            return e.map((x) => {
                return Math.floor(((x + 1.0) / 2.0) * 100.0);
            });
        });

        if (this.gameGrid[targetFloor] == null) {
            this.gameGrid[targetFloor] = [];
        }

        for (let x = 0; x < this.mapSize[0]; x++) {
            for (let y = 0; y < this.mapSize[1]; y++) {
                if (this.gameGrid[targetFloor] == null) {
                    this.gameGrid[targetFloor] = [];
                }
                if (this.gameGrid[targetFloor][x] == null) {
                    this.gameGrid[targetFloor][x] = [];
                }
                if (this.gameGrid[targetFloor][x][y] == null) {
                    this.gameGrid[targetFloor][x][y] = new Tile(TILETYPE.Empty, [x, y], noiseMap[x][y] <= 15);
                }
            }
        }

        this.populateAllNeighbors();
    }

    /**
     * Gets a list of positions that are neighbors of a given range of tiles
     */
    getNeighborsOfRange = (range: IGridRange): Point[] => {
        //returns a border of positions around a specified range
        const dict = {};
        if (range.startY > 0) {
            //add 'top'
            const xStart = Math.max(range.startX - 1, 0);
            const xStop = Math.min(range.endX + 1, this.mapSize[0] - 1);
            for (let x = xStart; x <= xStop; x++) {
                dict[`${x}:${range.startY - 1}`] = [x, range.startY - 1];
            }
        }
        if (range.startX > 0) {
            //add 'left'
            const yStart = Math.max(range.startY - 1, 0);
            const yStop = Math.min(range.endY + 1, this.mapSize[1] - 1);
            for (let y = yStart; y <= yStop; y++) {
                dict[`${range.startX - 1}:${y}`] = [range.startX - 1, y];
            }
        }
        if (range.endY + 1 < this.mapSize[1]) {
            //add 'bot'
            const xStart = Math.max(range.startX - 1, 0);
            const xStop = Math.min(range.endX + 1, this.mapSize[0] - 1);
            for (let x = xStart; x <= xStop; x++) {
                dict[`${x}:${range.endY + 1}`] = [x, range.endY + 1];
            }
        }
        if (range.endX + 1 < this.mapSize[0]) {
            //add 'right'
            const yStart = Math.max(range.startY - 1, 0);
            const yStop = Math.min(range.endY + 1, this.mapSize[1] - 1);
            for (let y = yStart; y <= yStop; y++) {
                dict[`${range.endX + 1}:${y}`] = [range.endX + 1, y];
            }
        }
        const result = [];
        for (const key of Object.keys(dict)) {
            result.push(dict[key]);
        }
        return result;
    }

    /**
     * Updates a single tile on the grid with neighbor information
     * @param pos Position to update
     */
    updateNeighbors = (pos: Point, floor?: number) => {
        //populate neighbors, N,NE,E,SE,S,SW,W,NW
        const x = pos[0];
        const y = pos[1];
        const targetFloor = floor || this.zLevel;
        if (y > 0) { //N
            this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.N, this.gameGrid[targetFloor][x][y - 1].getType());
        }
        if (y < this.mapSize[1] - 1) { //S
            this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.S, this.gameGrid[targetFloor][x][y + 1].getType());
        }
        if (x > 0) { //W
            this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.W, this.gameGrid[targetFloor][x - 1][y].getType());
        }
        if (x < this.mapSize[1] - 1) { //E
            this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.E, this.gameGrid[targetFloor][x + 1][y].getType());
        }
    }

    /**
     * Updates the 'neighbors' of all neighbors around a tile
     * @param pos Center of neighborhood
     */
    updateNeighborhood = (pos: Point) => {
        this.updateNeighbors(pos); //update the center item
        const thisType = this.gameGrid[this.zLevel][pos[0]][pos[1]].getType();
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(DIRECTION.S, thisType)) {
                // this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.mapSize[0] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(DIRECTION.W, thisType)) {
                // this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(DIRECTION.N, thisType)) {
                // this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(DIRECTION.E, thisType)) {
                // this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
    }

    populateAllNeighbors = () => {
        for (const floor of Object.keys(this.gameGrid)) {
            for (let x = 0; x < this.mapSize[0]; x++) {
                for (let y = 0; y < this.mapSize[1]; y++) {
                    this.updateNeighbors([x, y], Number(floor));
                }
            }
        }
    }

    //#endregion

    //#region cursor
    getCursorDrawData = (pos?: Point) => {
        let color = DEFAULTS.COLORS.CURSOR_DEFAULT;
        pos = pos || this.cursorPosition;
        if (this.cursorBuilding) {
            if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuildable(this.strictMode)) {
                color = DEFAULTS.COLORS.CURSOR_INVALID;
            } else {
                const tiles = BUILDINGS.IDS[this.currentMenuItem];
                if (tiles) {
                    const xOff = pos[0] - this.cursorPosition[0];
                    const yOff = pos[1] - this.cursorPosition[1];
                    const center = Math.floor(tiles.tiles.length / 2);
                    const trgTile = tiles.tiles[center + yOff][center + xOff];
                    color = trgTile.walkable === 0 ? DEFAULTS.COLORS.CURSOR_IMPASSABLE : DEFAULTS.COLORS.CURSOR_PASSABLE;
                }
            }
        }
        const targ = pos != null && pos.length === 2 ? pos : this.cursorPosition;
        return [
            targ[0],
            targ[1],
            DEFAULTS.CURSOR.CHAR,
            color,
            "transparent",
        ];
    }

    moveCursor = (dir: DIRECTION, shiftPressed?: boolean) => {
        const pos = this.cursorPosition.slice() as Point;
        const distance = shiftPressed ? 10 : 1;

        switch (dir) {
            case DIRECTION.N:
                if (pos[1] - this.cursorDiameter > 0) {
                    pos[1] = Math.max(this.cursorDiameter, pos[1] - distance);
                }
                break;
            case DIRECTION.NE:
                if (pos[1] - this.cursorDiameter > 0 ||
                    pos[0] + this.cursorDiameter < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorDiameter, pos[0] + distance);
                    pos[1] = Math.max(this.cursorDiameter, pos[1] - distance);
                }
                break;
            case DIRECTION.E:
                if (pos[0] + this.cursorDiameter < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorDiameter + 0, pos[0] + distance);
                }
                break;
            case DIRECTION.SE:
                if (pos[0] + this.cursorDiameter < this.mapSize[0] - 1 ||
                    pos[1] + this.cursorDiameter < this.mapSize[1] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorDiameter, pos[0] + distance);
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorDiameter, pos[1] + distance);
                }
                break;
            case DIRECTION.S:
                if (pos[1] + this.cursorDiameter < this.mapSize[1] - 1) {
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorDiameter, pos[1] + distance);
                }
                break;
            case DIRECTION.SW:
                if (pos[0] - this.cursorDiameter > 0 ||
                    pos[1] + this.cursorDiameter < this.mapSize[1] - 1) {
                    pos[0] = Math.max(this.cursorDiameter, pos[0] - 1);
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorDiameter, pos[1] + distance);
                }
                break;
            case DIRECTION.W:
                if (pos[0] - this.cursorDiameter > 0) {
                    pos[0] = Math.max(this.cursorDiameter, pos[0] - distance);
                }
                break;
            case DIRECTION.NW:
                if (pos[0] - this.cursorDiameter > 0 ||
                    pos[1] - this.cursorDiameter > 0) {
                    pos[0] = Math.max(this.cursorDiameter, pos[0] - distance);
                    pos[1] = Math.max(this.cursorDiameter, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        this.moveCursorTo(pos);
    }

    moveCursorTo = (targetPos: Point) => {
        if (targetPos[0] < 0 || targetPos[1] < 0 ||
            targetPos[0] >= this.mapSize[0] ||
            targetPos[1] >= this.mapSize[1]) {
            return;
        }

        targetPos[0] = Math.max(this.cursorDiameter, Math.min(this.mapSize[0] - 1 - this.cursorDiameter, targetPos[0]));
        targetPos[1] = Math.max(this.cursorDiameter, Math.min(this.mapSize[1] - 1 - this.cursorDiameter, targetPos[1]));

        store.dispatch(moveCursor(targetPos));
    }
    //#endregion cursor

    //#region designator
    getDesignatorDrawData = (coord: Point) => {
        return [
            coord[0],
            coord[1],
            ",",
            coord[0] === this.designatorStart[0] && coord[1] === this.designatorStart[1] ? "rgba(28, 68, 22, .5)" : "rgba(72, 36, 12, .3)",
            "transparent",
        ];
    }

    /**
     * Called when a designation finishes, updates the relevant tiles to the new type
     */
    designateRange = (/* range: IGridRange, item: MENU_ITEM */) => {
        //if we are mining floors, convert all empty neighbors to walls
        const range = this.getDesignatorRange();
        switch (this.currentMenuItem) {
            case MENU_ITEM.remove:
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.gameGrid[this.zLevel][x][y].isBuilding()) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TILETYPE.Empty, false)) {
                            // this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MENU_ITEM.wall:
                // Just need to make walls
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.gameGrid[this.zLevel][x][y].isBuilding()) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TILETYPE.Wall, true)) {
                            // this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MENU_ITEM.mine:
                // make everything highlighted a floor
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.gameGrid[this.zLevel][x][y].isBuilding()) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TILETYPE.Floor, true)) {
                            // this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                // make all neighbors that are EMPTY into WALLs
                const neighbors = this.getNeighborsOfRange(range);
                neighbors.forEach((neighbor) => {
                    if (this.gameGrid[this.zLevel][neighbor[0]][neighbor[1]].isBuilding()) {
                        //skip this
                        return;
                    }
                    const tile = this.gameGrid[this.zLevel][neighbor[0]][neighbor[1]];
                    if (tile.isUserSet()) {
                        //do not touch this tile
                    } else {
                        if (tile.getType() === TILETYPE.Empty) {
                            tile.setType(TILETYPE.Wall, false);
                            // this.dirtyTiles.push([neighbor[0], neighbor[1]]);
                        }
                    }
                });
                break;
            default:
                return;
        }

        this.populateAllNeighbors();
    }

    /**
     * Sets a tile to a specific type and return whether or not anything changed
     * @param pos Coordinate to set
     * @param type TILETYPE to set
     * @param userSet If user set or programatically set
     * @returns {true} if a change occured (tiletype changed)
     */
    setTile = (pos: Point, type: TILETYPE, userSet?: boolean): boolean => {
        if (this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(type, userSet)) {
            // // this.dirtyTiles.push(pos);
            return true;
        }

        return false;
    }
    //#endregion

    //#region builder

    tryPlaceBuildingAtCursor = () => {
        if (!this.cursorBuilding ||
            this.currentMenuItem == null ||
            this.cursorPosition == null) {
            return false;
        }
        return this.tryPlaceBuilding(this.currentMenuItem, this.cursorPosition);
    }

    /**
     * Attempts to place a building
     * @returns {true} if a building was placed
     */
    tryPlaceBuilding = (key: string, center: Point): boolean => {
        if (key == null || center == null) {
            return false;
        }
        const thisBuilding = BUILDINGS.IDS[key];
        if (thisBuilding == null) {
            return false;
        }
        const tiles = thisBuilding.tiles;
        const radius = Math.floor(tiles.length / 2.0);

        //check if we can build here
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[0].length; x++) {
                const targetTile = this.gameGrid[this.zLevel][center[0] - radius + x][center[1] - radius + y];
                if (!targetTile.isBuildable(this.strictMode)) {
                    return false;
                }
            }
        }

        const centerKey = `${this.zLevel}:${center[0]}:${center[1]}`;
        this.buildingIds[centerKey] = key;

        const edges: [Point, Point] = [[this.mapSize[0] + 1, this.mapSize[1] + 1], [-1, -1]];
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[0].length; x++) {
                const targX = center[0] - radius + x;
                const targY = center[1] - radius + y;
                edges[0][0] = Math.min(edges[0][0], targX);
                edges[0][1] = Math.min(edges[0][1], targY);
                edges[1][0] = Math.max(edges[1][0], targX);
                edges[1][1] = Math.max(edges[1][1], targY);
                const targetTile = this.gameGrid[this.zLevel][targX][targY];
                targetTile.setBuilding(key, tiles[y][x]);
                this.buildingTiles[`${this.zLevel}:${targX}:${targY}`] = centerKey;
            }
        }

        this.buildingList.push(centerKey);
        this.buildingBounds[centerKey] = edges;

        store.dispatch(setBuildingListData(this.buildingList, this.buildingTiles, this.buildingIds, this.buildingBounds));

        return true;
    }

    removeBuilding = () => {
        //
    }
    //#endregion

    //#region render
    /**
     * Renders the correct tile at the given coord
     * @param coord MAP coordinate to render
     */
    renderPosition = (coord: Point) => {
        let parms = null;
        if (this.isTileAnimating(coord)) {
            parms = this.getDesignatorDrawData(coord);
        } else {
            const radi = Math.floor(this.cursorDiameter / 2.0);
            if (!this.inspecting &&
                Math.abs(coord[0] - this.cursorPosition[0]) <= radi &&
                Math.abs(coord[1] - this.cursorPosition[1]) <= radi) {
                parms = this.getCursorDrawData(coord);
            } else {
                parms = this.gameGrid[this.zLevel][coord[0]][coord[1]].getDrawData(coord);
            }
        }

        const gridCoord = this.getGridCoord(coord);
        parms[0] = gridCoord[0];
        parms[1] = gridCoord[1];
        this.display.draw.apply(this.display, parms);
    }

    /**
     * Render the entire grid
     */
    render = () => {
        for (let x = this.camera[0]; x < this.camera[0] + this.gridSize[0]; x++) {
            for (let y = this.camera[1]; y < this.camera[1] + this.gridSize[1]; y++) {
                this.renderPosition([x, y]);
            }
        }
    }
    //#endregion render

    //#region helpers
    isTileAnimating = (pos: Point): boolean => {
        if (!this.animationToggle) {
            return false;
        }
        return this.isCoordDesignating(pos);
    }

    isCoordDesignating = (pos: Point): boolean => {
        if (this.isDesignating) {
            const bounds = this.getDesignatorRange();
            return pos[0] >= bounds.startX &&
                pos[1] >= bounds.startY &&
                pos[0] <= bounds.endX &&
                pos[1] <= bounds.endY;
        }

        return false;
    }

    getDesignatorRange = (pos?: Point): IGridRange => {
        const coord = pos ? pos : this.cursorPosition;
        const startX = Math.min(this.designatorStart[0], coord[0]);
        const endX = Math.max(this.designatorStart[0], coord[0]);
        const startY = Math.min(this.designatorStart[1], coord[1]);
        const endY = Math.max(this.designatorStart[1], coord[1]);

        return {
            startX,
            endX,
            startY,
            endY,
        };
    }

    /**
     * Converts a GRID coordinate to a MAP coordinate
     */
    getMapCoord = (coord: Point): Point => {
        if (coord == null || this.camera == null || this.camera.length !== 2) {
            return null;
        }
        return [
            coord[0] + this.camera[0],
            coord[1] + this.camera[1],
        ];
    }

    /**
     * Converts a MAP coordinate to a GRID coordinate
     */
    getGridCoord = (coord: Point): Point => {
        if (coord == null ||
            coord.length !== 2 ||
            this.camera == null ||
            this.camera.length !== 2 ||
            coord[0] < this.camera[0] ||
            coord[1] < this.camera[1] ||
            coord[0] >= this.camera[0] + this.gridSize[0] ||
            coord[1] >= this.camera[1] + this.gridSize[1]) {
            return null;
        }
        return [
            coord[0] - this.camera[0],
            coord[1] - this.camera[1],
        ];
    }
    //#endregion
}

export { Game };
