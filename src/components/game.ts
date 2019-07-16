import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import { Display } from "rot-js";

import { Constants, Direction } from "./constants";
import { Cursor } from "./cursor";
import { Tile, TileType } from "./Tile";

class Game {
    private display: Display;
    private tileSheetImage: HTMLImageElement;
    private noiseMap: number[][];
    private gridSize: [number, number]; //[width, height]

    private cursor: Cursor;

    private gameGrid: Tile[][];
    private dirtyTiles: Array<[number, number]>;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;

        this.gridSize = [
            Math.floor(container.offsetWidth / Constants.TILE_WIDTH),
            Math.floor(container.offsetHeight / Constants.TILE_HEIGHT),
        ];

        const center: [number, number] = [
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ];

        this.cursor = new Cursor(center);

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

        this.dirtyTiles = new Array();

        this.render();
    }

    public getCanvas() {
        return this.display.getContainer();
    }

    public getMousePosition = (e: MouseEvent | TouchEvent) => {
        return this.display.eventToPosition(e);
    }

    public moveCursor(direction: Direction, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const distance = shiftPressed ? 10 : 1;
        switch (direction) {
            case Direction.N:
                if (pos[1] > 0) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[1] = Math.max(0, pos[1] - distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.NE:
                if (pos[1] > 0 || pos[0] < this.gridSize[0] - 1) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    pos[1] = Math.max(0, pos[1] - distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.E:
                if (pos[0] < this.gridSize[0] - 1) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.SE:
                if (pos[0] < this.gridSize[0] - 1 || pos[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.min(this.gridSize[0] - 1, pos[0] + distance);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.S:
                if (pos[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.SW:
                if (pos[0] > 0 || pos[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - 1);
                    pos[1] = Math.min(this.gridSize[1] - 1, pos[1] + distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.W:
                if (pos[0] > 0) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            case Direction.NW:
                if (pos[0] > 0 || pos[1] > 0) {
                    this.dirtyTiles.push([pos[0], pos[1]]);
                    pos[0] = Math.max(0, pos[0] - distance);
                    pos[1] = Math.max(0, pos[1] - distance);
                    this.dirtyTiles.push([pos[0], pos[1]]);
                }
                break;
            default:
                return;
        }

        this.cursor.setPosition(pos);
        this.renderDirty();
    }

    public moveCursorTo(targetPos: [number, number]) {
        const pos = this.cursor.getPosition();
        //const target = this.

        if ((pos[0] === targetPos[0] && pos[1] === targetPos[1]) ||
            (targetPos[0] < 0 || targetPos[1] < 0 ||
                targetPos[0] > this.gameGrid.length - 1 ||
                targetPos[1] > this.gameGrid[0].length - 1)) {
            return;
        }

        this.dirtyTiles.push(pos);
        this.dirtyTiles.push(targetPos);

        this.cursor.setPosition(targetPos);
        this.renderDirty();
    }

    public setTile(pos: [number, number], type: TileType) {
        this.gameGrid[pos[0]][pos[1]].setType(type);
        this.dirtyTiles.push(pos);
        this.updateNeighborhood(pos);
        this.renderDirty();
        console.log(this.gameGrid[pos[0]][pos[1]].getCharacter());
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
    }

    /**
     * Renders the correct tile at the given coord
     * @param coord [x, y] grid coordinate to render
     */
    private renderPosition(coord: [number, number]) {
        //renders the appropriate thing at the specified coord
        //for now, check if it needs to be the cursor or the gamemap tile
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

    /**
     * Re-draws only 'dirty' tiles
     */
    private renderDirty() {
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
}

export { Game };
