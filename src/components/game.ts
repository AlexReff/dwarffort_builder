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

        this.dirtyTiles = new Array();

        this.render();
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
            const parms = this.cursor.getDrawData();
            this.display.draw.apply(this.display, parms);
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
