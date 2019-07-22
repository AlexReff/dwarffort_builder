// import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
// import * as ROT from "rot-js";
import { default as Display } from "./rot/display";

import { Constants, Direction, IGridRange, MenuItemId, Point } from "./constants";
import { Cursor } from "./cursor";
import { Designator } from "./designator";
import { Tile, TileType } from "./tile";

class Game {
    private display: Display;
    private tileSheetImage: HTMLImageElement;
    private gridSize: [number, number]; //size of the rendered game grid [width, height]
    private mapSize: [number, number]; //size of the full map (including non-rendered portions)
    private center: Point; //camera center? top left?

    private cursor: Cursor;

    private simplex: OpenSimplexNoise;

    private zLevel: number;
    private gameGrid: { [key: number]: Tile[][] };
    private dirtyTiles: Point[];

    private animationToggle: boolean;
    private animationInterval: number;

    private designator: Designator;
    private designatorTiles: Point[];

    private buildings: {
        [key: string]:
        {
            buildingKey: MenuItemId,
            buildingCenter: Point,
        },
    };

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;
        this.animationToggle = false;
        this.zLevel = 0;
        this.gameGrid = {};
        this.simplex = new OpenSimplexNoise(Date.now());

        this.gridSize = [
            Math.floor(container.offsetWidth / Constants.TILE_WIDTH),
            Math.floor(container.offsetHeight / Constants.TILE_HEIGHT),
        ];

        this.mapSize = [
            48 * 2,
            48 * 2,
        ];

        const center: Point = [
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ];

        this.cursor = new Cursor(center);
        this.designator = new Designator();

        this.buildings = {};

        this.display = new Display({
            width: this.gridSize[0],
            height: this.gridSize[1],
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: Constants.TILE_WIDTH,
            tileHeight: Constants.TILE_HEIGHT,
            tileSet: this.tileSheetImage,
            tileMap: Constants.TILE_MAP,
            tileColorize: true,
            bg: "transparent",
        });

        container.append(this.display.getContainer());

        this.populateFloor();
        // this.noiseMap = this.simplex.array2D(this.gridSize[0], this.gridSize[1]).map((e) => {
        //     return e.map((x) => {
        //         return Math.floor(((x + 1.0) / 2.0) * 100.0);
        //     });
        // });

        // // this.gameGrid = new Array();
        // this.gameGrid[this.zLevel] = [];
        // for (let x = 0; x < this.gridSize[0]; x++) {
        //     const thisRow = [];
        //     for (let y = 0; y < this.gridSize[1]; y++) {
        //         //handle logic for populating initial grid
        //         thisRow.push(new Tile(TileType.Empty, this.noiseMap[x][y] <= Constants.GRID_TILE_DECORATED_PERCENT));
        //     }
        //     this.gameGrid[this.zLevel].push(thisRow);
        // }

        this.populateAllNeighbors();

        this.dirtyTiles = [];
        this.designatorTiles = [];

        this.animationInterval = window.setInterval(() => (this.toggleAnimation()), 250);

        this.render();
    }

    public populateFloor(floor?: number) {
        const targetFloor = floor || this.zLevel;
        const noiseMap = this.simplex.array2D(this.mapSize[0], this.mapSize[1]).map((e) => {
            return e.map((x) => {
                return Math.floor(((x + 1.0) / 2.0) * 100.0);
            });
        });

        this.gameGrid[targetFloor] = [];
        for (let x = 0; x < this.gridSize[0]; x++) {
            const thisRow = [];
            for (let y = 0; y < this.gridSize[1]; y++) {
                thisRow.push(new Tile(TileType.Empty, noiseMap[x][y] <= Constants.GRID_TILE_DECORATED_PERCENT));
            }
            this.gameGrid[targetFloor].push(thisRow);
        }
    }

    public getCanvas() {
        return this.display.getContainer();
    }

    public getMousePosition = (e: MouseEvent | TouchEvent) => {
        return this.display.eventToPosition(e);
    }

    public isDesignating() {
        return this.designator.isDesignating();
    }

    public moveCursor(direction: Direction, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();
        const distance = shiftPressed ? 10 : 1;
        switch (direction) {
            case Direction.N:
                if (pos[1] - offset > 0) {
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case Direction.NE:
                if (pos[1] - offset > 0 || pos[0] + offset < this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case Direction.E:
                if (pos[0] + offset < this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.gridSize[0] - 1 - offset, pos[0] + distance);
                }
                break;
            case Direction.SE:
                if (pos[0] + offset < this.gridSize[0] - 1 || pos[1] + offset < this.gridSize[1] - 1) {
                    pos[0] = Math.min(this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.min(this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.S:
                if (pos[1] + offset < this.gridSize[1] - 1) {
                    pos[1] = Math.min(this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.SW:
                if (pos[0] - offset > 0 || pos[1] + offset < this.gridSize[1] - 1) {
                    pos[0] = Math.max(offset, pos[0] - 1);
                    pos[1] = Math.min(this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.W:
                if (pos[0] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                }
                break;
            case Direction.NW:
                if (pos[0] - offset > 0 || pos[1] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        this.moveCursorTo(pos);
    }

    public moveCursorTo(targetPos: Point) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();

        if ((pos[0] === targetPos[0] && pos[1] === targetPos[1]) || //already there
            (targetPos[0] < 0 || targetPos[1] < 0 || //out of bounds
                targetPos[0] > this.gameGrid[this.zLevel].length - 1 ||
                targetPos[1] > this.gameGrid[this.zLevel][0].length - 1)) {
            return;
        }

        targetPos[0] = Math.max(offset, Math.min(this.gameGrid[this.zLevel].length - 1 - offset, targetPos[0]));
        targetPos[1] = Math.max(offset, Math.min(this.gameGrid[this.zLevel][0].length - 1 - offset, targetPos[1]));

        this.cursor.setPosition(targetPos);

        if (this.designator.isDesignating()) {
            const range = this.designator.getRange(targetPos);
            for (let x = range.startX; x <= range.endX; x++) {
                for (let y = range.startY; y <= range.endY; y++) {
                    this.designatorTiles.push([x, y]);
                }
            }
        }

        this.render();
    }

    public zUp() {
        //go up one z level
        return this.goToZLevel(this.zLevel + 1);
    }

    public zDown() {
        //go down one z level
        return this.goToZLevel(this.zLevel - 1);
    }

    /**
     * Sets a tile to a specific type and return whether or not anything changed
     * @param pos Coordinate to set
     * @param type TileType to set
     * @param userSet If user set or programatically set
     * @returns {true} if a change occured (tiletype changed)
     */
    public setTile(pos: Point, type: TileType, userSet?: boolean): boolean {
        if (this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(type, userSet)) {
            this.dirtyTiles.push(pos);
            return true;
        }

        return false;
    }

    /**
     * Handles enter key presses + right mouse clicks
     * @returns True if we need to un-set the highlightedMenuItem in index.tsx
     */
    public handleEnterKey(highlightedMenuItem?: MenuItemId): boolean {
        if (highlightedMenuItem == null) {
            return;
        }
        if (this.cursor.isBuilding()) {
            return this.placeBuilding();
        } else {
            this.handleDesignation(highlightedMenuItem);
            return false;
        }
    }

    public handleDesignation(highlightedMenuItem: MenuItemId) {
        if (this.designator.isDesignating()) {
            this.finishDesignate(highlightedMenuItem);
        } else {
            this.beginDesignate();
        }
    }

    public beginDesignate() {
        const pos = this.cursor.getPosition();
        this.designator.startDesignating(pos);
        this.designatorTiles.push([pos[0], pos[1]]);
        this.renderPosition(pos);
    }

    public finishDesignate(item: MenuItemId) {
        const cursorPos = this.cursor.getPosition();
        const range = this.designator.getRange(cursorPos);
        this.designateRange(range, item);
        this.designator.endDesignating();
        this.designatorTiles = [];
        this.render();
    }

    public cancelDesignate() {
        this.designator.endDesignating();
        this.designatorTiles = [];
        this.render();
    }

    public stopBuilding() {
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
    }

    public isBuilding() {
        return this.cursor.isBuilding();
    }

    public setCursorToBuilding(e: MenuItemId) {
        const target = Constants.BUILDING_TILE_MAP[e];
        if (target == null) {
            this.cursor.stopBuilding();
            return;
        }

        this.cursor.setBuilding(e);
        this.render();
    }

    public getTileAtCursor = (): Tile => {
        const pos = this.cursor.getPosition();
        return this.gameGrid[this.zLevel][pos[0]][pos[1]];
    }

    private goToZLevel(level: number) {
        if (!(level in this.gameGrid)) {
            this.populateFloor(level);
        }
        this.zLevel = level;
        this.render();
    }

    private placeBuilding = (): boolean => {
        const tiles = this.cursor.getBuildingTiles();
        for (const tile of tiles) {
            if (this.coordIsBuilding(tile.pos)) {
                return false;
            }
        }
        const key = this.cursor.getBuildingKey();
        const center = this.cursor.getPosition();
        for (const tile of tiles) {
            this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
            this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
                buildingKey: key,
                buildingCenter: center,
            };
        }
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
        return true;
    }

    private coordIsBuilding = (coord: Point): boolean => {
        if (this.buildings == null) {
            return false;
        }

        return `${coord[0]}:${coord[1]}` in this.buildings;
    }

    /**
     * Called when a designation finishes, updates the relevant tiles to the new type
     */
    private designateRange = (range: IGridRange, item: MenuItemId) => {
        //if we are mining floors, convert all empty neighbors to walls
        switch (item) {
            case MenuItemId.remove:
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Empty, false)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MenuItemId.wall:
                // Just need to make walls
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Wall, true)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MenuItemId.mine:
                // make everything highlighted a floor
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Floor, true)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                // make all neighbors that are EMPTY into WALLs
                const neighbors = this.getNeighborsOfRange(range);
                neighbors.forEach((neighbor) => {
                    if (this.coordIsBuilding(neighbor)) {
                        //skip this
                        return;
                    }
                    const tile = this.gameGrid[this.zLevel][neighbor[0]][neighbor[1]];
                    if (tile.getUserSet()) {
                        //do not touch this tile
                    } else {
                        if (tile.getType() === TileType.Empty) {
                            tile.setType(TileType.Wall, false);
                            this.dirtyTiles.push([neighbor[0], neighbor[1]]);
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
     * Gets a list of positions that are neighbors of a given range of tiles
     */
    private getNeighborsOfRange(range: IGridRange): Point[] {
        //returns a border of positions around a specified range
        const dict = {};
        if (range.startY > 0) {
            //add 'top'
            const xStart = Math.max(range.startX - 1, 0);
            const xStop = Math.min(range.endX + 1, this.gameGrid[this.zLevel].length - 1);
            for (let x = xStart; x <= xStop; x++) {
                dict[`${x}:${range.startY - 1}`] = [x, range.startY - 1];
            }
        }
        if (range.startX > 0) {
            //add 'left'
            const yStart = Math.max(range.startY - 1, 0);
            const yStop = Math.min(range.endY + 1, this.gameGrid[this.zLevel].length - 1);
            for (let y = yStart; y <= yStop; y++) {
                dict[`${range.startX - 1}:${y}`] = [range.startX - 1, y];
            }
        }
        if (range.endY + 1 < this.gameGrid[this.zLevel][0].length) {
            //add 'bot'
            const xStart = Math.max(range.startX - 1, 0);
            const xStop = Math.min(range.endX + 1, this.gameGrid[this.zLevel].length - 1);
            for (let x = xStart; x <= xStop; x++) {
                dict[`${x}:${range.endY + 1}`] = [x, range.endY + 1];
            }
        }
        if (range.endX + 1 < this.gameGrid[this.zLevel].length) {
            //add 'right'
            const yStart = Math.max(range.startY - 1, 0);
            const yStop = Math.min(range.endY + 1, this.gameGrid[this.zLevel].length - 1);
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

    private isTileAnimating = (pos: Point): boolean => {
        if (!this.animationToggle) {
            return false;
        }
        if (this.designator.isDesignating()) {
            const cursor = this.cursor.getPosition();
            const bounds = this.designator.getRange(cursor);
            return pos[0] >= bounds.startX && pos[1] >= bounds.startY && pos[0] <= bounds.endX && pos[1] <= bounds.endY;
        }

        return false;
    }

    private toggleAnimation = () => {
        this.animationToggle = !this.animationToggle;
        // this.render();
        // this.renderAnimated();
        this.renderDirty();
        this.renderDesignated();
    }

    /**
     * Updates a single tile on the grid with neighbor information
     * @param pos Position to update
     */
    private updateNeighbors(pos: Point) {
        //populate neighbors, N,NE,E,SE,S,SW,W,NW
        const x = pos[0];
        const y = pos[1];
        if (y > 0) { //N
            this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.N, this.gameGrid[this.zLevel][x][y - 1].getType());

            // if (x < this.gridSize[1] - 1) { //NE
            //     this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.NE, this.gameGrid[this.zLevel][x + 1][y - 1].getType());
            // }

            // if (x > 0) { //NW
            //     this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.NW, this.gameGrid[this.zLevel][x - 1][y - 1].getType());
            // }
        }
        if (y < this.gridSize[1] - 1) { //S
            this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.S, this.gameGrid[this.zLevel][x][y + 1].getType());

            // if (x < this.gridSize[0] - 1) { //SE
            //     this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.SE, this.gameGrid[this.zLevel][x][y + 1].getType());
            // }

            // if (x > 0) { //SW
            //     this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.SW, this.gameGrid[this.zLevel][x - 1][y + 1].getType());
            // }
        }
        if (x > 0) { //W
            this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.W, this.gameGrid[this.zLevel][x - 1][y].getType());
        }
        if (x < this.gridSize[1] - 1) { //E
            this.gameGrid[this.zLevel][x][y].setNeighbor(Direction.E, this.gameGrid[this.zLevel][x + 1][y].getType());
        }
    }

    /**
     * Updates the 'neighbors' of all neighbors around a tile
     * @param pos Center of neighborhood
     */
    private updateNeighborhood(pos: Point) {
        this.updateNeighbors(pos); //update the center item
        const thisType = this.gameGrid[this.zLevel][pos[0]][pos[1]].getType();
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(Direction.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.gridSize[0] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.gridSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(Direction.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(Direction.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        /*
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(Direction.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }

            if (pos[0] < this.gridSize[1] - 1) { //NE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] - 1].setNeighbor(Direction.SW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] - 1]);
                }
            }

            if (pos[0] > 0) { //NW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] - 1].setNeighbor(Direction.SE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] - 1]);
                }
            }
        }
        if (pos[1] < this.gridSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(Direction.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }

            if (pos[0] < this.gridSize[0] - 1) { //SE
                if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1] + 1].setNeighbor(Direction.NW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] + 1]);
                }
            }

            if (pos[0] > 0) { //SW
                if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1] + 1].setNeighbor(Direction.NE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] + 1]);
                }
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[this.zLevel][pos[0] - 1][pos[1]].setNeighbor(Direction.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        if (pos[0] < this.gridSize[1] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        */
    }

    private populateAllNeighbors() {
        for (let x = 0; x < this.gridSize[0]; x++) {
            for (let y = 0; y < this.gridSize[1]; y++) {
                this.updateNeighbors([x, y]);
            }
        }
    }

    /**
     * Render the entire grid
     */
    private render() {
        for (let x = 0; x < this.gameGrid[this.zLevel].length; x++) {
            for (let y = 0; y < this.gameGrid[this.zLevel][0].length; y++) {
                this.renderPosition([x, y]);
            }
        }
        this.dirtyTiles = [];
    }

    private renderCursor() {
        for (const i of this.cursor.getRange()) {
            this.renderPosition(i);
        }
    }

    /**
     * Renders the correct tile at the given coord
     * @param coord [x, y] grid coordinate to render
     */
    private renderPosition = (coord: Point) => {
        if (this.isTileAnimating(coord)) {
            // const parms = this.getDesignateDrawData();
            // this.display.draw.apply(this.display, parms);
            const parms = this.designator.getDrawData(coord);
            this.display.draw.apply(this.display, parms);
            // this.display.draw(coord[0], coord[1], ",", "rgba(28, 68, 22, .4)", "transparent");
        } else {
            //const pos = this.cursor.getPosition();
            if (this.cursor.coordIsCursor(coord)) {
                // render just cursor
                const parms = this.cursor.getDrawData(coord, this.coordIsBuilding(coord));
                this.display.draw.apply(this.display, parms);

                // render cursor over tile
                // this.display.draw(coord[0],
                //     coord[1],
                //     [this.gameGrid[coord[0]][coord[1]].getCharacter(), this.cursor.getCharacter()],
                //     [this.gameGrid[coord[0]][coord[1]].getColor(), this.cursor.getColor()],
                //     ["transparent", "transparent"]);
            } else {
                // this.gameGrid[coord[0]][coord[1]].render(this.display.draw, coord);
                const parms = this.gameGrid[this.zLevel][coord[0]][coord[1]].getDrawData(coord);
                this.display.draw.apply(this.display, parms);
                // this.display.draw(coord[0], coord[1], this.gameGrid[coord[0]][coord[1]].getCharacter(), this.gameGrid[coord[0]][coord[1]].getColor(), "transparent");
            }
        }
    }

    /**
     * Re-draws only 'dirty' tiles
     */
    private renderDirty = () => {
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

    private renderDesignated = () => {
        if (this.designatorTiles == null || this.designatorTiles.length === 0) {
            return;
        }
        for (const coord of this.designatorTiles) {
            this.renderPosition(coord);
        }
    }

    // private renderAnimated = () => {
    //     if (this.animatedTiles == null || Object.keys(this.animatedTiles).length === 0) {
    //         return;
    //     }
    //     for (const coord of Object.keys(this.animatedTiles)) {
    //         this.renderPosition(this.animatedTiles[coord]);
    //     }

    //     // if (this.isDesignating) {
    //     //     const cursor = this.cursor.getPosition();
    //     //     const bounds = this.designator.getRange(cursor);
    //     //     for (let x = bounds.startX; x <= bounds.endX; x++) {
    //     //         for (let y = bounds.startY; y <= bounds.endY; y++) {
    //     //             this.renderPosition([x, y]);
    //     //             // this.dirtyTiles.push([x, y]);
    //     //         }
    //     //     }
    //     // }

    //     // const cursor = this.cursor.getPosition();
    //     // if (this.isDesignating && (this.designationStart[0] !== cursor[0] || this.designationStart[1] !== cursor[1])) {
    //     //     const startX = Math.min(this.designationStart[0], cursor[0]);
    //     //     const endX = Math.max(this.designationStart[0], cursor[0]);
    //     //     const startY = Math.min(this.designationStart[1], cursor[1]);
    //     //     const endY = Math.max(this.designationStart[1], cursor[1]);
    //     //     for (let x = startX; x <= endX; x++) {
    //     //         for (let y = startY; y <= endY; y++) {
    //     //             this.renderPosition([x, y]);
    //     //             this.dirtyTiles.push([x, y]);
    //     //         }
    //     //     }
    //     // }
    // }
}

export { Game };
