// import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import { default as Display } from "./rot/display";

import { Direction, GRID_TILE_DECORATED_PERCENT, IGridRange, Point, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import rng from "./rot/rng";
import { Tile, TileType } from "./tile";

class Game {
    protected display: Display;
    protected tileSheetImage: HTMLImageElement;
    protected gridSize: [number, number]; //size of the rendered game grid [width, height]
    protected mapSize: [number, number]; //size of the full map (including non-rendered portions)
    protected zLevel: number;
    protected gameGrid: { [key: number]: Tile[][] };
    protected noiseMaps: { [key: number]: OpenSimplexNoise };
    protected container: HTMLElement;

    protected dirtyTiles: Point[];
    protected coordIsBuilding: (coord: [number, number]) => boolean;
    protected render: () => void;
    protected renderDirty: () => void;
    protected renderDesignated: () => void;
    protected renderPosition: (coord: Point) => void;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;
        this.container = container;
        this.zLevel = 0;
        this.gameGrid = {};
        this.noiseMaps = {};

        this.gridSize = [
            container.offsetWidth / TILE_WIDTH,
            container.offsetHeight / TILE_HEIGHT,
        ];

        this.mapSize = [
            Math.max(48 * 2, this.gridSize[0]),
            Math.max(48 * 2, this.gridSize[1]),
        ];
        // this.updateGameSize(this.container);
    }

    public destroy = () => {
        if (this.display != null) {
            this.display.getContainer().remove();
        }

        this.display = null;
    }

    public populateAllFloors = () => {
        for (const floor of Object.keys(this.gameGrid)) {
            this.populateFloor(Number(floor));
        }
    }

    public populateFloor = (floor?: number) => {
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
            // const thisRow = [];
            for (let y = 0; y < this.mapSize[1]; y++) {
                // thisRow.push(new Tile(TileType.Empty, noiseMap[x][y] <= GRID_TILE_DECORATED_PERCENT));
                if (this.gameGrid[targetFloor] == null) {
                    this.gameGrid[targetFloor] = [];
                }
                if (this.gameGrid[targetFloor][x] == null) {
                    this.gameGrid[targetFloor][x] = [];
                }
                if (this.gameGrid[targetFloor][x][y] == null) {
                    this.gameGrid[targetFloor][x][y] = new Tile(TileType.Empty, noiseMap[x][y] <= GRID_TILE_DECORATED_PERCENT);
                }
            }
            // this.gameGrid[targetFloor].push(thisRow);
        }

        this.populateAllNeighbors();
    }

    public getCanvas() {
        return this.display.getContainer();
    }

    public zUp(): number {
        //go up one z level
        return this.goToZLevel(this.zLevel + 1);
    }

    public zDown(): number {
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

    protected updateGameSize = (container: HTMLElement) => {
        if (this.gridSize != null && this.gridSize.length === 2) {
            this.gridSize = [
                Math.max(this.gridSize[0], Math.floor(container.offsetWidth / TILE_WIDTH)),
                Math.max(this.gridSize[1], Math.floor(container.offsetHeight / TILE_HEIGHT)),
            ];
        } else {
            this.gridSize = [
                Math.floor(container.offsetWidth / TILE_WIDTH),
                Math.floor(container.offsetHeight / TILE_HEIGHT),
            ];
        }

        this.mapSize = [
            Math.max(this.mapSize[0], this.gridSize[0]),
            Math.max(this.mapSize[1], this.gridSize[1]),
        ];
    }

    protected goToZLevel(level: number) {
        if (!(level in this.gameGrid)) {
            this.populateFloor(level);
        }
        this.zLevel = level;
        this.render();
        return this.zLevel;
    }

    /**
     * Gets a list of positions that are neighbors of a given range of tiles
     */
    protected getNeighborsOfRange(range: IGridRange): Point[] {
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

    /**
     * Updates a single tile on the grid with neighbor information
     * @param pos Position to update
     */
    protected updateNeighbors(pos: Point, floor?: number) {
        //populate neighbors, N,NE,E,SE,S,SW,W,NW
        const x = pos[0];
        const y = pos[1];
        const targetFloor = floor || this.zLevel;
        if (y > 0) { //N
            this.gameGrid[targetFloor][x][y].setNeighbor(Direction.N, this.gameGrid[targetFloor][x][y - 1].getType());

            // if (x < this.mapSize[1] - 1) { //NE
            //     this.gameGrid[targetFloor][x][y].setNeighbor(Direction.NE, this.gameGrid[targetFloor][x + 1][y - 1].getType());
            // }

            // if (x > 0) { //NW
            //     this.gameGrid[targetFloor][x][y].setNeighbor(Direction.NW, this.gameGrid[targetFloor][x - 1][y - 1].getType());
            // }
        }
        if (y < this.mapSize[1] - 1) { //S
            this.gameGrid[targetFloor][x][y].setNeighbor(Direction.S, this.gameGrid[targetFloor][x][y + 1].getType());

            // if (x < this.mapSize[0] - 1) { //SE
            //     this.gameGrid[targetFloor][x][y].setNeighbor(Direction.SE, this.gameGrid[targetFloor][x][y + 1].getType());
            // }

            // if (x > 0) { //SW
            //     this.gameGrid[targetFloor][x][y].setNeighbor(Direction.SW, this.gameGrid[targetFloor][x - 1][y + 1].getType());
            // }
        }
        if (x > 0) { //W
            this.gameGrid[targetFloor][x][y].setNeighbor(Direction.W, this.gameGrid[targetFloor][x - 1][y].getType());
        }
        if (x < this.mapSize[1] - 1) { //E
            this.gameGrid[targetFloor][x][y].setNeighbor(Direction.E, this.gameGrid[targetFloor][x + 1][y].getType());
        }
    }

    /**
     * Updates the 'neighbors' of all neighbors around a tile
     * @param pos Center of neighborhood
     */
    protected updateNeighborhood(pos: Point) {
        this.updateNeighbors(pos); //update the center item
        const thisType = this.gameGrid[this.zLevel][pos[0]][pos[1]].getType();
        if (pos[1] > 0) { //N
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] - 1].setNeighbor(Direction.S, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[0] < this.mapSize[0] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] < this.mapSize[1] - 1) { //S
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

            if (pos[0] < this.mapSize[1] - 1) { //NE
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
        if (pos[1] < this.mapSize[1] - 1) { //S
            if (this.gameGrid[this.zLevel][pos[0]][pos[1] + 1].setNeighbor(Direction.N, thisType)) {
                this.dirtyTiles.push([pos[0], pos[1] + 1]);
            }

            if (pos[0] < this.mapSize[0] - 1) { //SE
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
        if (pos[0] < this.mapSize[1] - 1) { //E
            if (this.gameGrid[this.zLevel][pos[0] + 1][pos[1]].setNeighbor(Direction.W, thisType)) {
                this.dirtyTiles.push([pos[0] + 1, pos[1]]);
            }
        }
        */
    }

    protected populateAllNeighbors() {
        for (const floor of Object.keys(this.gameGrid)) {
            for (let x = 0; x < this.mapSize[0]; x++) {
                for (let y = 0; y < this.mapSize[1]; y++) {
                    this.updateNeighbors([x, y], Number(floor));
                }
            }
        }
    }
}

export { Game };
