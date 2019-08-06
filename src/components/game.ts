// import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import store, { getAllStoreData, getUpdatedStoreData } from "./redux/store";
import { default as Display } from "./rot/display";

import { CURSOR_BEHAVIOR, DEFAULTS, DIRECTION, IGridRange, KEYS, MENU_ITEM, Point, TILE_H, TILE_MAP, TILE_W } from "./constants";
import { GameAnimator } from "./game/animator";
import { GameCamera } from "./game/camera";
import { GameCursor } from "./game/cursor";
import { GameDesignator } from "./game/designator";
import { SetGridSize, SetMapSize } from "./redux/camera/actions";
import { moveCursor } from "./redux/cursor/actions";
import { selectMenuItem } from "./redux/menu/actions";
import { Initialize } from "./redux/settings/actions";
import rng from "./rot/rng";
import { Tile, TileType } from "./tile";
import Util from "./util";

export class Game {
    displayElement: HTMLElement;

    //redux
    gridSize: Point = null; //size of the rendered game grid [width, height]
    mapSize: Point = null; //size of the full map (including non-rendered portions)
    zLevel: number = null;
    strictMode: boolean = null;
    cursorPosition: Point = null;
    isDesignating: boolean = null;
    cursorBuilding: boolean = null;
    camera: Point = null;
    buildingRange: Point[] = null;
    inspecting: boolean = null;
    currentMenuItem: MENU_ITEM = null;
    cursorMode: CURSOR_BEHAVIOR = null;

    display: Display;
    tileSheetImage: HTMLImageElement;
    gameGrid: { [key: number]: Tile[][] };
    noiseMaps: { [key: number]: OpenSimplexNoise };
    container: HTMLElement;
    initRan: boolean;
    needsRender: boolean;
    // paintOverwrite: boolean;

    animator: GameAnimator;
    gameCamera: GameCamera;
    gameCursor: GameCursor;
    designator: GameDesignator;

    canvasRef: any;

    dirtyTiles: Point[];

    constructor(image: HTMLImageElement, container: HTMLElement, canvas: any) {
        this.initRan = false;
        this.needsRender = true;
        this.tileSheetImage = image;
        this.container = container;
        this.zLevel = 0;
        this.gameGrid = {};
        this.noiseMaps = {};
        this.strictMode = DEFAULTS.STRICT_MODE;
        // this.paintOverwrite = DEFAULTS.PAINT_OVERWRITE;
        this.canvasRef = canvas;

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

        // this.cursorPosition = [
        //     Math.ceil((this.camera[0] + this.gridSize[0]) / 2.0),
        //     Math.ceil((this.camera[1] + this.gridSize[1]) / 2.0),
        // ];

        store.dispatch(Initialize(this.gridSize, this.mapSize, this.camera /* this.cursorPosition */));
        store.subscribe(this.getStoreData);

        this.animator = new GameAnimator();
        this.gameCamera = new GameCamera();
        this.gameCursor = new GameCursor();
        this.designator = new GameDesignator();

        document.addEventListener("keydown", this.handleKeyPress);

        this.init();
    }

    getStoreData = () => {
        const oldData = getUpdatedStoreData(this, store);

        if (this.initRan && this.display != null &&
            (this.needsRender || Object.keys(oldData).length > 0)) {
            this.render();
        }
    }

    init = () => {
        // this.updateGameSize(this.container);

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
        // this.container.append(this.displayElement);

        this.displayElement.addEventListener("contextmenu", this.handleContextMenu);
        this.displayElement.addEventListener("click", this.handleGridClick);

        // this.resetCamera();
        this.render();
        this.initRan = true;
    }

    destroy = () => {
        // if (this.display != null) {
        //     this.display.getContainer().remove();
        // }

        this.displayElement = null;
        this.display = null;
    }

    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        // const pos = this.game.getMousePosition(e);
        // const pos = [this.props.mouseLeft, this.props.mouseTop] as Point;
        let pos = null;
        if ("touches" in e) {
            pos = [e.touches[0].clientX, e.touches[0].clientY] as Point;
        } else {
            pos = [e.clientX, e.clientY] as Point;
        }
        // const pos = [(e as any).clientX, (e as any).clientY] as Point;
        // this.game.moveCursorTo(pos);
        this.gameCursor.moveCursorTo(pos);
        if (this.inspecting) {
            //right-click inspect building/item
        } else {
            this.handleEnterRightClick();
        }
        return false;
    }

    handleEnterRightClick = () => {
        if (this.handleEnterKey(this.currentMenuItem)) {
            store.dispatch(selectMenuItem(null));
        }
    }

    populateAllFloors = () => {
        for (const floor of Object.keys(this.gameGrid)) {
            this.populateFloor(Number(floor));
        }
    }

    // setStrictMode = (strict: boolean) => {
    //     this.strictMode = strict;
    //     // this.render();
    // }

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
     * @returns top-left coordinate for grid item based on mouse position
     */
    getHighlighterGridPosition = (clientX: number, clientY: number): [number, number] => {
        if (this.canvasRef != null) {
            const bounds = this.canvasRef.getBoundingClientRect();
            const maxHeight = this.canvasRef.offsetHeight - TILE_H + bounds.top;
            const maxWidth = this.canvasRef.offsetWidth - TILE_W + bounds.left;
            const leftPos = Math.max(0, Math.min(maxWidth, clientX - (clientX % TILE_W)));
            const topPos = Math.max(0, Math.min(maxHeight, clientY - (clientY % TILE_H)));
            return [leftPos, topPos];
        }
    }

    // zUp = (): number => {
    //     //go up one z level
    //     return this.goToZLevel(this.zLevel + 1);
    // }

    // zDown = (): number => {
    //     //go down one z level
    //     return this.goToZLevel(this.zLevel - 1);
    // }

    /**
     * Sets a tile to a specific type and return whether or not anything changed
     * @param pos Coordinate to set
     * @param type TileType to set
     * @param userSet If user set or programatically set
     * @returns {true} if a change occured (tiletype changed)
     */
    setTile = (pos: Point, type: TileType, userSet?: boolean): boolean => {
        if (this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(type, userSet)) {
            this.dirtyTiles.push(pos);
            return true;
        }

        return false;
    }

    handleGridClick = (e: MouseEvent | TouchEvent) => {
        if (e instanceof MouseEvent && e.button !== 0) {
            return;
        }
        e.preventDefault();

        //if the user is inspecting, show the details of the selected item
        //if the user single-left-clicks, move the CURSOR to that position
        //if the user is click+dragging on inspect....

        if (this.inspecting) {
            //handle inspection / click+drag highlighter
        } else {
            const gridPos = this.display.eventToPosition({ clientX: window.mouseX, clientY: window.mouseY });
            const pos = Util.getMapCoord(gridPos);
            this.gameCursor.moveCursorTo(pos);
            // this.needsRender = true;
            // if (this.isDesignating) {
            //     // this.game.finishDesignate(this.props.currentMenuItem);
            // } else if (this.cursorMode === CURSOR_BEHAVIOR.MODERN) {
            //     // if (this.game.paint(this.props.currentMenuItem)) {
            //     //     // this.setState({
            //     //     //     currentMenuItem: null,
            //     //     // });
            //     //     this.props.selectMenuItem(null);
            //     // }
            // }
        }
    }

    getGridPosition = (mouseLeft: number, mouseTop: number): Point => {
        return null;
    }

    handleEscapeKey = () => {
        //this.game.stopBuilding();
        //this.game.cancelDesignate();
    }

    // /**
    //  * Handles enter key presses + right mouse clicks
    //  * @returns True if we need to un-set the highlightedMenuItem in index.tsx
    //  */
    handleEnterKey = (highlightedMenuItem?: MENU_ITEM): boolean => {
        if (highlightedMenuItem == null) {
            return;
        }
        if (this.cursorBuilding) {
            // return this.builder.tryPlaceBuilding();
        } else {
            this.designator.handleDesignation();
            return false;
        }
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return; //don't override ctrl+btn browser hotkeys
        }
        switch (e.keyCode) {
            case KEYS.VK_RETURN:
                e.preventDefault();
                // this.handleEnterRightClick();
                break;
            case KEYS.VK_UP:
            case KEYS.VK_NUMPAD8:
                //move north
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.N, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_PAGE_UP:
            case KEYS.VK_NUMPAD9:
                //move ne
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.NE, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_NUMPAD6:
                //move east
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.E, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_PAGE_DOWN:
            case KEYS.VK_NUMPAD3:
                //move se
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.SE, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_NUMPAD2:
                //move south
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.S, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_END:
            case KEYS.VK_NUMPAD1:
                //move sw
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.SW, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_NUMPAD4:
                //move west
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.W, e.shiftKey);
                this.render();
                break;
            case KEYS.VK_HOME:
            case KEYS.VK_NUMPAD7:
                //move nw
                e.preventDefault();
                this.gameCursor.moveCursor(DIRECTION.NW, e.shiftKey);
                this.render();
                break;
            // case KEYS.VK_PERIOD:
            // case KEYS.VK_GREATER_THAN:
            //     this.setState({
            //         // zLevel: this.game.zUp(),
            //         // hasChangedZLevel: true,
            //     });
            //     break;
            // case KEYS.VK_COMMA:
            // case KEYS.VK_LESS_THAN:
            //     this.setState({
            //         // zLevel: this.game.zDown(),
            //         // hasChangedZLevel: true,
            //     });
            //     break;
            default:
                break;
        }
    }

    /**
     * Renders the correct tile at the given coord
     * @param coord MAP coordinate to render
     */
    renderPosition = (coord: Point) => {
        // const gridCoord = this.camera.getGridCoord(coord);
        let parms = null;
        if (Util.isTileAnimating(coord)) {
            parms = this.designator.getDrawData(coord);
            // this.display.draw.apply(this.display, parms);
        } else {
            //const cursorPos = this.cursor.getPosition();
            // const cursorPos = this.gameCursor.getPosition();
            const cursorPos = this.cursorPosition;
            if (/* this.isDesignating && */ coord[0] === cursorPos[0] && coord[1] === cursorPos[1]) {
                //parms = this.designator.getDrawData(gridCoord);
                parms = this.gameCursor.getDrawData(coord, !this.coordIsBuildable(coord));
                // if (this.cursor.coordIsCursor(coord)) {
                //     // render just cursor
                //     parms = this.cursor.getDrawData(coord, !this.coordIsBuildable(coord));
            } else {
                parms = this.gameGrid[this.zLevel][coord[0]][coord[1]].getDrawData(coord);
            }
            // this.parseParms(parms);
            // this.display.draw.apply(this.display, parms);
        }

        const gridCoord = Util.getGridCoord(coord);
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
        this.dirtyTiles = [];
        this.needsRender = false;
    }

    /**
     * Re-draws only 'dirty' tiles
     */
    renderDirty = () => {
        if (this.dirtyTiles == null || this.dirtyTiles.length === 0) {
            return;
        }
        const dirty = new Array<Point>();
        while (this.dirtyTiles.length > 0) {
            dirty.push(this.dirtyTiles.pop());
        }
        for (const coord of dirty) {
            this.renderPosition(coord);
        }
    }

    renderCursor = () => {
        for (const i of this.buildingRange) {
            this.renderPosition(i);
        }
    }

    // renderDesignated = () => {
    //     if (this.designatorTiles == null || this.designatorTiles.length === 0) {
    //         return;
    //     }
    //     for (const coord of this.designatorTiles) {
    //         this.renderPosition(coord);
    //     }
    // }

    updateGameSize = (container: HTMLElement) => {
        if (this.gridSize != null && this.gridSize.length === 2) {
            store.dispatch(SetGridSize([
                Math.max(this.gridSize[0], Math.floor(container.offsetWidth / TILE_W)),
                Math.max(this.gridSize[1], Math.floor(container.offsetHeight / TILE_H)),
            ]));
        } else {
            store.dispatch(SetGridSize([
                Math.floor(container.offsetWidth / TILE_W),
                Math.floor(container.offsetHeight / TILE_H),
            ]));
        }

        store.dispatch(SetMapSize([
            Math.max(this.mapSize[0], this.gridSize[0]),
            Math.max(this.mapSize[1], this.gridSize[1]),
        ]));

        this.needsRender = true;
    }

    coordIsBuilding = (coord: Point): boolean => {
        return this.gameGrid[this.zLevel][coord[0]][coord[1]].isBuilding();
    }

    coordIsBuildable = (coord: Point): boolean => {
        const isBldg = this.coordIsBuilding(coord);
        if (this.strictMode) {
            const tileType = this.gameGrid[this.zLevel][coord[0]][coord[1]].getType();
            //
            if (tileType === TileType.Floor && !isBldg) {
                return true;
            }
        } else {
            return !isBldg;
        }

        return false;
    }

    // goToZLevel = (level: number) => {
    //     if (!(level in this.gameGrid)) {
    //         this.populateFloor(level);
    //     }
    //     this.zLevel = level;
    //     // this.render();
    //     return this.zLevel;
    // }

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

            // if (x < this.mapSize[1] - 1) { //NE
            //     this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.NE, this.gameGrid[targetFloor][x + 1][y - 1].getType());
            // }

            // if (x > 0) { //NW
            //     this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.NW, this.gameGrid[targetFloor][x - 1][y - 1].getType());
            // }
        }
        if (y < this.mapSize[1] - 1) { //S
            this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.S, this.gameGrid[targetFloor][x][y + 1].getType());

            // if (x < this.mapSize[0] - 1) { //SE
            //     this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.SE, this.gameGrid[targetFloor][x][y + 1].getType());
            // }

            // if (x > 0) { //SW
            //     this.gameGrid[targetFloor][x][y].setNeighbor(DIRECTION.SW, this.gameGrid[targetFloor][x - 1][y + 1].getType());
            // }
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
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.mapSize[0] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(DIRECTION.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(DIRECTION.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(DIRECTION.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        /*
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(DIRECTION.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }

            if (pos[0] < this.mapSize[1] - 1) { //NE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] - 1].setNeighbor(DIRECTION.SW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] - 1]);
                }
            }

            if (pos[0] > 0) { //NW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] - 1].setNeighbor(DIRECTION.SE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] - 1]);
                }
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(DIRECTION.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }

            if (pos[0] < this.mapSize[0] - 1) { //SE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] + 1].setNeighbor(DIRECTION.NW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] + 1]);
                }
            }

            if (pos[0] > 0) { //SW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] + 1].setNeighbor(DIRECTION.NE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] + 1]);
                }
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(DIRECTION.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        if (pos[0] < this.mapSize[1] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(DIRECTION.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
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
}

// const mapStateToProps = (state) => {
//     // const { byIds, allIds } = state.todos || {};
//     // const todos =
//     //     allIds && allIds.length
//     //         ? allIds.map((id) => (byIds ? { ...byIds[id], id } : null))
//     //         : null;
//     // return { todos };
// };

// export default connect(mapStateToProps, {
//     //list of actions
// })(Game);
// // export { Game };
