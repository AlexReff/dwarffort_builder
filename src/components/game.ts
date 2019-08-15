// import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import store, { getAllStoreData, getUpdatedStoreData } from "./redux/store";
import { default as Display } from "./rot/display";

import { BUILDINGS, CURSOR_BEHAVIOR, DEFAULTS, DIRECTION, IGridRange, KEYS, MENU_ITEM, Point, TILE_H, TILE_MAP, TILE_W } from "./constants";
import { zLevelGoto } from "./redux/camera/actions";
import { moveCursor } from "./redux/cursor/actions";
import { designatorEnd, designatorStart } from "./redux/designator/actions";
import { Initialize } from "./redux/settings/actions";
import rng from "./rot/rng";
import { Tile, TileType } from "./tile";
import { selectMenuItem } from "./redux/menu/actions";

export class Game {
    displayElement: HTMLElement;
    canvasRef: any;
    display: Display;
    tileSheetImage: HTMLImageElement;
    gameGrid: { [key: number]: Tile[][] };
    noiseMaps: { [key: number]: OpenSimplexNoise };
    initRan: boolean;
    animationToggle: boolean;
    animationInterval: number;

    //redux
    gridSize: Point = null; //size of the rendered game grid [width, height]
    mapSize: Point = null; //size of the full map (including non-rendered portions)
    cursorPosition: Point = null;
    cursorDiameter: number = null;
    cursorRadius: number = null;
    camera: Point = null;
    zLevel: number = null;
    strictMode: boolean = null;
    isDesignating: boolean = null;
    cursorBuilding: boolean = null;
    designatorStart: Point = null;
    buildingRange: Point[] = null;
    inspecting: boolean = null;
    currentMenuItem: MENU_ITEM = null;
    cursorMode: CURSOR_BEHAVIOR = null;

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
        // getAllStoreData(this, store);

        if (oldData.zLevel != null) {
            this.populateFloor(this.zLevel);
        }

        if (this.initRan) {
            this.render();
        }
    }

    init = () => {
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
        this.render();
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
        const gridPos = this.display.eventToPosition(e);
        const mapPos = this.getMapCoord(gridPos);
        this.cursorPosition = mapPos.slice() as Point;
        this.moveCursorTo(mapPos);
        if (this.inspecting) {
            //right-click inspect building/item
        } else {
            this.handleEnterRightClick();
        }
        return false;
    }

    handleEnterRightClick = () => {
        if (this.currentMenuItem == null) {
            return;
        }
        if (this.cursorBuilding) {
            // return this.builder.tryPlaceBuilding();
            if (this.tryPlaceBuilding()) {
                store.dispatch(selectMenuItem(null));
            }
        } else {
            // this.designator.handleDesignation();
            if (this.isDesignating) {
                // this.finishDesignate();
                this.designateRange();
                store.dispatch(designatorEnd());
            } else {
                // this.beginDesignate();
                // this.designatorStart = this.cursorPosition.slice() as Point;
                // store.dispatch(designatorStart(this.designatorStart));
                store.dispatch(designatorStart(this.cursorPosition));
            }
            // return false;
        }
        // store.dispatch(selectMenuItem(null));
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
                if (this.isDesignating) {
                    e.preventDefault();
                    this.cancelDesignate();
                }
                break;
            case KEYS.VK_RETURN:
                e.preventDefault();
                // this.handleEnterRightClick();
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
                    this.gameGrid[targetFloor][x][y] = new Tile(TileType.Empty, [x, y], noiseMap[x][y] <= 15);
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
                // // this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.mapSize[0] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(DIRECTION.W, thisType)) {
                // // this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(DIRECTION.N, thisType)) {
                // // this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(DIRECTION.E, thisType)) {
                // // this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        /*
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(DIRECTION.S, thisType)) {
                // this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }

            if (pos[0] < this.mapSize[1] - 1) { //NE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] - 1].setNeighbor(DIRECTION.SW, thisType)) {
                    // this.dirtyTiles.push([pos[0] + 1, pos[1] - 1]);
                }
            }

            if (pos[0] > 0) { //NW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] - 1].setNeighbor(DIRECTION.SE, thisType)) {
                    // this.dirtyTiles.push([pos[0] - 1, pos[1] - 1]);
                }
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(DIRECTION.N, thisType)) {
                // this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }

            if (pos[0] < this.mapSize[0] - 1) { //SE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] + 1].setNeighbor(DIRECTION.NW, thisType)) {
                    // this.dirtyTiles.push([pos[0] + 1, pos[1] + 1]);
                }
            }

            if (pos[0] > 0) { //SW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] + 1].setNeighbor(DIRECTION.NE, thisType)) {
                    // this.dirtyTiles.push([pos[0] - 1, pos[1] + 1]);
                }
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(DIRECTION.E, thisType)) {
                // this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        if (pos[0] < this.mapSize[1] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(DIRECTION.W, thisType)) {
                // this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        */
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
                const tiles = BUILDINGS[this.currentMenuItem];
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

        // this.moveCameraToIncludePoint(pos);
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

        store.dispatch(moveCursor(targetPos) as any);

        // if (this.designator.isDesignating()) {
        //     const range = this.designator.getRange(targetPos);
        //     for (let x = range.startX; x <= range.endX; x++) {
        //         for (let y = range.startY; y <= range.endY; y++) {
        //             this.designatorTiles.push([x, y]);
        //         }
        //     }
        // }

        // this.moveCameraToIncludePoint(targetPos);
        // this.render();
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
                        if (this.setTile([x, y], TileType.Empty, false)) {
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
                        if (this.setTile([x, y], TileType.Wall, true)) {
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
                        if (this.setTile([x, y], TileType.Floor, true)) {
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
                        if (tile.getType() === TileType.Empty) {
                            tile.setType(TileType.Wall, false);
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
     * @param type TileType to set
     * @param userSet If user set or programatically set
     * @returns {true} if a change occured (tiletype changed)
     */
    setTile = (pos: Point, type: TileType, userSet?: boolean): boolean => {
        if (this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(type, userSet)) {
            // // this.dirtyTiles.push(pos);
            return true;
        }

        return false;
    }
    //#endregion

    //#region builder

    /**
     * Attempts to place a building
     * @returns {true} if a building was placed
     */
    tryPlaceBuilding = (): boolean => {
        if (!this.cursorBuilding) {
            return;
        }
        const tiles = BUILDINGS[this.currentMenuItem].tiles;

        //check if we can build here
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[0].length; x++) {
                const targetTile = this.gameGrid[this.zLevel][this.cursorPosition[0] - this.cursorRadius + x][this.cursorPosition[1] - this.cursorRadius + y];
                if (!targetTile.isBuildable(this.strictMode)) {
                    return false;
                }
            }
        }
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[0].length; x++) {
                const targetTile = this.gameGrid[this.zLevel][this.cursorPosition[0] - this.cursorRadius + x][this.cursorPosition[1] - this.cursorRadius + y];
                targetTile.setBuilding(this.currentMenuItem, tiles[y][x]);
                // this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
                //     buildingKey: tileKey as MENU_ITEM,
                //     buildingCenter: center,
                // };
            }
        }
        // for (const tileKey of Object.keys(tiles)) {
        //     const tile = tiles[tileKey];
        //     this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
        //     this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
        //         buildingKey: tileKey as MENU_ITEM,
        //         buildingCenter: center,
        //     };
        //     this.updateNeighborhood([tile.pos[0], tile.pos[1]]);
        // }
        // this.cursor.stopBuilding();
        // this.designator.endDesignating();
        // this.render();
        return true;
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
            if (Math.abs(coord[0] - this.cursorPosition[0]) <= radi &&
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
        // // this.dirtyTiles = [];
        // this.needsRender = false;
    }

    // /**
    //  * Re-draws only 'dirty' tiles
    //  */
    // renderDirty = () => {
    //     if (// this.dirtyTiles == null || // this.dirtyTiles.length === 0) {
    //         return;
    //     }
    //     const dirty = new Array<Point>();
    //     while (// this.dirtyTiles.length > 0) {
    //         dirty.push(// this.dirtyTiles.pop());
    //     }
    //     for (const coord of dirty) {
    //         this.renderPosition(coord);
    //     }
    // }
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

    // handleMouseDown = (e: MouseEvent) => {
    //     if (e.button === 0) {
    //         this.mouseLeftPressed(true);
    //         if (this.inspecting) {
    //             this.setHighlightPos([window.mouseX, window.mouseY]);
    //         }
    //     }
    // }

    // handleMouseUp = (e: MouseEvent) => {
    //     if (e.button === 0) {
    //         if (this.highlighting) {
    //             // handle 'highlight selection'
    //         }
    //         this.mouseLeftPressed(false);
    //         this.endHighlight();
    //         // this.setState({
    //         //     leftMouseDown: false,
    //         //     highlighting: false,
    //         //     highlightingStart: null,
    //         // });
    //     }
    // }

    // coordIsBuildable = (coord: Point): boolean => {
    //     const isBldg = this.gameGrid[this.zLevel][coord[0]][coord[1]].isBuilding();
    //     if (isBldg) {
    //         return false;
    //     }
    //     if (this.strictMode) {
    //         const tileType = this.gameGrid[this.zLevel][coord[0]][coord[1]].getType();
    //         if (tileType === TileType.Floor) {
    //             return true;
    //         }
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    // renderCursor = () => {
    //     for (const i of this.buildingRange) {
    //         this.renderPosition(i);
    //     }
    // }

    // renderDesignated = () => {
    //     if (this.designatorTiles == null || this.designatorTiles.length === 0) {
    //         return;
    //     }
    //     for (const coord of this.designatorTiles) {
    //         this.renderPosition(coord);
    //     }
    // }

    // updateGameSize = (container: HTMLElement) => {
    //     if (this.gridSize != null && this.gridSize.length === 2) {
    //         store.dispatch(SetGridSize([
    //             Math.max(this.gridSize[0], Math.floor(container.offsetWidth / TILE_W)),
    //             Math.max(this.gridSize[1], Math.floor(container.offsetHeight / TILE_H)),
    //         ]));
    //     } else {
    //         store.dispatch(SetGridSize([
    //             Math.floor(container.offsetWidth / TILE_W),
    //             Math.floor(container.offsetHeight / TILE_H),
    //         ]));
    //     }

    //     store.dispatch(SetMapSize([
    //         Math.max(this.mapSize[0], this.gridSize[0]),
    //         Math.max(this.mapSize[1], this.gridSize[1]),
    //     ]));

    //     this.needsRender = true;
    // }
