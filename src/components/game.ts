import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import { Display } from "rot-js";

import { Constants, Direction, MenuItemId } from "./constants";
import { Cursor } from "./cursor";
import { Designator } from "./designator";
import { Tile, TileType } from "./Tile";

class Game {
    private display: Display;
    private tileSheetImage: HTMLImageElement;
    private noiseMap: number[][];
    private gridSize: [number, number]; //[width, height]

    private cursor: Cursor;

    private gameGrid: Tile[][];
    private dirtyTiles: Array<[number, number]>;

    private animationToggle: boolean;
    private animationInterval: number;
    private animatedTiles: { [key: string]: [number, number] }; //currently only the designation markers

    private isDesignating: boolean;
    private designator: Designator;
    private designatorTiles: Array<[number, number]>;
    // private designationStart: [number, number];

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;
        this.isDesignating = false;
        // this.designationStart = null;
        this.animationToggle = false;

        this.gridSize = [
            Math.floor(container.offsetWidth / Constants.TILE_WIDTH),
            Math.floor(container.offsetHeight / Constants.TILE_HEIGHT),
        ];

        const center: [number, number] = [
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ];

        this.cursor = new Cursor(center);
        this.designator = new Designator();

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

        const simplex = new OpenSimplexNoise(Date.now());
        this.noiseMap = simplex.array2D(this.gridSize[0], this.gridSize[1]).map((e) => {
            return e.map((x) => {
                return Math.floor(((x + 1.0) / 2.0) * 100.0);
            });
        });

        this.gameGrid = new Array();
        for (let x = 0; x < this.gridSize[0]; x++) {
            const thisRow = [];
            for (let y = 0; y < this.gridSize[1]; y++) {
                //handle logic for populating initial grid
                if (this.noiseMap[x][y] <= Constants.GRID_TILE_DECORATED_PERCENT) {
                    thisRow.push(Tile.EmptyDecorated());
                } else {
                    thisRow.push(Tile.Empty());
                }
            }
            this.gameGrid.push(thisRow);
        }

        this.populateAllNeighbors();

        this.dirtyTiles = [];
        this.animatedTiles = {};
        this.designatorTiles = [];

        this.animationInterval = window.setInterval(() => (this.toggleAnimation()), 250);

        this.render();
    }

    public getCanvas() {
        return this.display.getContainer();
    }

    public getMousePosition = (e: MouseEvent | TouchEvent) => {
        return this.display.eventToPosition(e);
    }

    public getIsDesignating() {
        return this.isDesignating;
    }

    public moveCursor(direction: Direction, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const distance = shiftPressed ? 10 : 1;
        switch (direction) {
            case Direction.N:
                if (pos[1] > 0) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[1] = Math.max(0, pos[1] - distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.NE:
                if (pos[1] > 0 || pos[0] < this.gridSize[0] - 1) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    pos[1] = Math.max(0, pos[1] - distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.E:
                if (pos[0] < this.gridSize[0] - 1) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.SE:
                if (pos[0] < this.gridSize[0] - 1 || pos[1] < this.gridSize[1] - 1) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.S:
                if (pos[1] < this.gridSize[1] - 1) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.SW:
                if (pos[0] > 0 || pos[1] < this.gridSize[1] - 1) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - 1);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.W:
                if (pos[0] > 0) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.NW:
                if (pos[0] > 0 || pos[1] > 0) {
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - distance);
                    pos[1] = Math.max(0, pos[1] - distance);
                    // this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            default:
                return;
        }

        this.moveCursorTo(pos);
    }

    public moveCursorTo(targetPos: [number, number]) {
        const pos = this.cursor.getPosition();

        if ((pos[0] === targetPos[0] && pos[1] === targetPos[1]) || //already there
            (targetPos[0] < 0 || targetPos[1] < 0 ||                //out of bounds
                targetPos[0] > this.gameGrid.length - 1 ||
                targetPos[1] > this.gameGrid[0].length - 1)) {
            return;
        }

        // if (this.isDesignating) {
        //     const minX = Math.min(pos[0], targetPos[0]);
        //     const maxX = Math.max(pos[0], targetPos[0]);
        //     const minY = Math.min(pos[1], targetPos[1]);
        //     const maxY = Math.max(pos[1], targetPos[1]);
        //     for (let x = minX; x <= maxX; x++) {
        //         for (let y = minY; y <= maxY; y++) {
        //             this.dirtyTiles.push([x, y]);
        //         }
        //     }
        // }

        this.cursor.setPosition(targetPos);

        if (this.isDesignating) {
            while (this.designatorTiles.length > 0) {
                this.dirtyTiles.push(this.designatorTiles.pop());
            }
            const range = this.designator.getRange(targetPos);
            for (let x = range.startX; x <= range.endX; x++) {
                for (let y = range.startY; y <= range.endY; y++) {
                    this.designatorTiles.push([x, y]);
                }
            }
        } else {
            this.dirtyTiles.push(pos);
            this.dirtyTiles.push(targetPos);
        }

        this.renderDirty();
        this.renderDesignated();
        // this.render();
    }

    public setTile(pos: [number, number], type: TileType) {
        this.gameGrid[pos[0]][pos[1]].setType(type);
        this.dirtyTiles.push(pos);
        this.updateNeighborhood(pos);
        this.renderDirty();
    }

    public handleDesignation(highlightedMenuItem?: MenuItemId) {
        // called when 'enter' is pressed
        if (highlightedMenuItem == null) {
            return;
        }
        if (this.isDesignating) {
            this.finishDesignate(highlightedMenuItem);
        } else {
            this.beginDesignate();
        }
    }

    public beginDesignate() {
        //set the current position to a 'designating' img, store it
        this.isDesignating = true;
        const pos = this.cursor.getPosition();
        this.designator.startDesignating(pos);
        this.designatorTiles.push([pos[0], pos[1]]);
        this.renderPosition(pos);
    }

    public finishDesignate(item: MenuItemId) {
        const cursorPos = this.cursor.getPosition();

        const range = this.designator.getRange(cursorPos);
        for (let x = range.startX; x <= range.endX; x++) {
            for (let y = range.startY; y <= range.endY; y++) {
                // this.dirtyTiles.push([x, y]);
            }
        }

        this.isDesignating = false;
        this.designatorTiles = [];
        this.render();
        // this.renderDirty();
        // this.renderPosition(start);
        // this.renderPosition(cursorPos);
    }

    public cancelDesignate() {
        this.isDesignating = false;
        // delete this.animatedTiles[`${this.designationStart[0]}:${this.designationStart[1]}`];
        this.designatorTiles = [];
        // this.designationStart = null;
    }

    private isTileAnimating = (pos: [number, number]): boolean => {
        if (!this.animationToggle) {
            return false;
        }

        if (this.animatedTiles[`${pos[0]}:${pos[1]}`] != null) {
            return true;
        }

        // return true if this tile is either in animatedTiles
        // or we are designating and the cursor is not at the designation start
        if (this.isDesignating) {
            const cursor = this.cursor.getPosition();
            const bounds = this.designator.getRange(cursor);
            return pos[0] >= bounds.startX && pos[1] >= bounds.startY && pos[0] <= bounds.endX && pos[1] <= bounds.endY;
        }

        return false;
    }

    private toggleAnimation = () => {
        this.animationToggle = !this.animationToggle;
        // this.render();
        this.renderAnimated();
        this.renderDesignated();
        // this.renderDirty();
    }

    /**
     * Updates a single tile on the grid with neighbor information
     * @param pos Position to update
     */
    private updateNeighbors(pos: [number, number]) {
        //populate neighbors, N,NE,E,SE,S,SW,W,NW
        const x = pos[0];
        const y = pos[1];
        if (y > 0) { //N
            this.gameGrid[x][y].setNeighbor(Direction.N, this.gameGrid[x][y - 1].getType());

            if (x < this.gridSize[1] - 1) { //NE
                this.gameGrid[x][y].setNeighbor(Direction.NE, this.gameGrid[x + 1][y - 1].getType());
            }

            if (x > 0) { //NW
                this.gameGrid[x][y].setNeighbor(Direction.NW, this.gameGrid[x - 1][y - 1].getType());
            }
        }
        if (y < this.gridSize[1] - 1) { //S
            this.gameGrid[x][y].setNeighbor(Direction.S, this.gameGrid[x][y + 1].getType());

            if (x < this.gridSize[0] - 1) { //SE
                this.gameGrid[x][y].setNeighbor(Direction.SE, this.gameGrid[x][y + 1].getType());
            }

            if (x > 0) { //SW
                this.gameGrid[x][y].setNeighbor(Direction.SW, this.gameGrid[x - 1][y + 1].getType());
            }
        }
        if (x > 0) { //W
            this.gameGrid[x][y].setNeighbor(Direction.W, this.gameGrid[x - 1][y].getType());
        }
        if (x < this.gridSize[1] - 1) { //E
            this.gameGrid[x][y].setNeighbor(Direction.E, this.gameGrid[x + 1][y].getType());
        }
    }

    /**
     * Updates the 'neighbors' properties of all neighbors around a tile
     * @param pos Center of neighborhood
     */
    private updateNeighborhood(pos: [number, number]) {
        this.updateNeighbors(pos); //update the center item
        const thisType = this.gameGrid[pos[0]][pos[1]].getType();
        if (pos[1] > 0) { //N
            if (this.gameGrid[pos[0]][pos[1] - 1].setNeighbor(Direction.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.gridSize[0] - 1) { //E
            if (this.gameGrid[pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.gridSize[1] - 1) { //S
            if (this.gameGrid[pos[0]][pos[1] + 1].setNeighbor(Direction.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[pos[0] - 1][pos[1]].setNeighbor(Direction.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        /*
        if (pos[1] > 0) { //N
            if (this.gameGrid[pos[0]][pos[1] - 1].setNeighbor(Direction.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }

            if (pos[0] < this.gridSize[1] - 1) { //NE
                if (this.gameGrid[pos[0] + 1][pos[1] - 1].setNeighbor(Direction.SW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] - 1]);
                }
            }

            if (pos[0] > 0) { //NW
                if (this.gameGrid[pos[0] - 1][pos[1] - 1].setNeighbor(Direction.SE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] - 1]);
                }
            }
        }
        if (pos[1] < this.gridSize[1] - 1) { //S
            if (this.gameGrid[pos[0]][pos[1] + 1].setNeighbor(Direction.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }

            if (pos[0] < this.gridSize[0] - 1) { //SE
                if (this.gameGrid[pos[0] + 1][pos[1] + 1].setNeighbor(Direction.NW, thisType)) {
                    this.dirtyTiles.push([pos[0] + 1, pos[1] + 1]);
                }
            }

            if (pos[0] > 0) { //SW
                if (this.gameGrid[pos[0] - 1][pos[1] + 1].setNeighbor(Direction.NE, thisType)) {
                    this.dirtyTiles.push([pos[0] - 1, pos[1] + 1]);
                }
            }
        }
        if (pos[0] > 0) { //W
            if (this.gameGrid[pos[0] - 1][pos[1]].setNeighbor(Direction.E, thisType)) {
                this.dirtyTiles.push([pos[0] - 1, pos[1]]);
            }
        }
        if (pos[0] < this.gridSize[1] - 1) { //E
            if (this.gameGrid[pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
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
        for (let x = 0; x < this.gameGrid.length; x++) {
            for (let y = 0; y < this.gameGrid[0].length; y++) {
                this.renderPosition([x, y]);
            }
        }
        this.dirtyTiles = new Array();
    }

    /**
     * Renders the correct tile at the given coord
     * @param coord [x, y] grid coordinate to render
     */
    private renderPosition = (coord: [number, number]) => {
        //renders the appropriate thing at the specified coord
        //for now, check if it needs to be the cursor or the gamemap tile
        // const designate = this.isDesignating && this.designationStart != null && this.designationStart.length === 2;
        if (this.isTileAnimating(coord)) {
            // const parms = this.getDesignateDrawData();
            // this.display.draw.apply(this.display, parms);
            this.display.draw(coord[0], coord[1], ",", "rgba(28, 68, 22, .4)", "transparent");
        } else {
            const pos = this.cursor.getPosition();
            if (pos[0] === coord[0] && pos[1] === coord[1]) {
                // render just cursor
                const parms = this.cursor.getDrawData();
                this.display.draw.apply(this.display, parms);

                // render cursor over tile
                // this.display.draw(coord[0],
                //     coord[1],
                //     [this.gameGrid[coord[0]][coord[1]].getCharacter(), this.cursor.getCharacter()],
                //     [this.gameGrid[coord[0]][coord[1]].getColor(), this.cursor.getColor()],
                //     ["transparent", "transparent"]);
            } else {
                this.display.draw(coord[0], coord[1], this.gameGrid[coord[0]][coord[1]].getCharacter(), this.gameGrid[coord[0]][coord[1]].getColor(), "transparent");
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
        const dirty = new Array<[number, number]>();
        while (this.dirtyTiles.length > 0) {
            dirty.push(this.dirtyTiles.pop());
        }
        for (const coord of dirty) {
            this.renderPosition(coord);
        }
    }

    private renderAnimated = () => {
        if (this.animatedTiles == null || Object.keys(this.animatedTiles).length === 0) {
            return;
        }
        for (const coord of Object.keys(this.animatedTiles)) {
            this.renderPosition(this.animatedTiles[coord]);
        }

        // if (this.isDesignating) {
        //     const cursor = this.cursor.getPosition();
        //     const bounds = this.designator.getRange(cursor);
        //     for (let x = bounds.startX; x <= bounds.endX; x++) {
        //         for (let y = bounds.startY; y <= bounds.endY; y++) {
        //             this.renderPosition([x, y]);
        //             // this.dirtyTiles.push([x, y]);
        //         }
        //     }
        // }

        // const cursor = this.cursor.getPosition();
        // if (this.isDesignating && (this.designationStart[0] !== cursor[0] || this.designationStart[1] !== cursor[1])) {
        //     const startX = Math.min(this.designationStart[0], cursor[0]);
        //     const endX = Math.max(this.designationStart[0], cursor[0]);
        //     const startY = Math.min(this.designationStart[1], cursor[1]);
        //     const endY = Math.max(this.designationStart[1], cursor[1]);
        //     for (let x = startX; x <= endX; x++) {
        //         for (let y = startY; y <= endY; y++) {
        //             this.renderPosition([x, y]);
        //             this.dirtyTiles.push([x, y]);
        //         }
        //     }
        // }
    }

    private renderDesignated = () => {
        if (this.designatorTiles == null || this.designatorTiles.length === 0) {
            return;
        }
        for (const coord of this.designatorTiles) {
            this.renderPosition(coord);
        }
    }
}

export { Game };
