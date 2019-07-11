import * as _ from "lodash";
import { default as OpenSimplexNoise } from "open-simplex-noise";
import { Display } from "rot-js";

import { Constants, Direction } from "./constants";
import { Tile, TileItem } from "./Tile";

class Game {
    private display: Display;
    private tileSheetImage: HTMLImageElement;
    private cursorPosition: [number, number];
    private cursorCharacter: string;
    private noiseMap: number[][];
    private gridSize: [number, number]; //[width, height]

    private gameGrid: Tile[][];
    private dirtyTiles: Array<[number, number]>;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;

        this.gridSize = [
            Math.floor(container.offsetWidth / Constants.TILE_WIDTH),
            Math.floor(container.offsetHeight / Constants.TILE_HEIGHT),
        ];

        this.display = new Display({
            width: this.gridSize[0],
            height: this.gridSize[1],
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: Constants.TILE_WIDTH,
            tileHeight: Constants.TILE_HEIGHT,
            tileSet: this.tileSheetImage,
            tileMap: Constants.TILE_MAP,
            tileColorize: false,
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
                if (this.noiseMap[x][y] >= 85) {
                    thisRow.push(new Tile(TileItem.EmptyDecorated));
                } else {
                    thisRow.push(Tile.Empty);
                }
            }
            this.gameGrid.push(thisRow);
        }

        this.cursorPosition = [0, 0];
        this.cursorCharacter = ".";

        this.dirtyTiles = new Array();

        this.render();
    }

    public moveCursor(direction: Direction) {
        switch (direction) {
            case Direction.N:
                if (this.cursorPosition[1] > 0) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[1] = Math.max(0, this.cursorPosition[1] - 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.NE:
                if (this.cursorPosition[1] > 0 || this.cursorPosition[0] < this.gridSize[0] - 1) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.min(this.gridSize[0] - 1, this.cursorPosition[0] + 1);
                    this.cursorPosition[1] = Math.max(0, this.cursorPosition[1] - 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.E:
                if (this.cursorPosition[0] < this.gridSize[0] - 1) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.min(this.gridSize[0] - 1, this.cursorPosition[0] + 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.SE:
                if (this.cursorPosition[0] < this.gridSize[0] - 1 || this.cursorPosition[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.min(this.gridSize[0] - 1, this.cursorPosition[0] + 1);
                    this.cursorPosition[1] = Math.min(this.gridSize[1] - 1, this.cursorPosition[1] + 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.S:
                if (this.cursorPosition[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[1] = Math.min(this.gridSize[1] - 1, this.cursorPosition[1] + 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.SW:
                if (this.cursorPosition[0] > 0 || this.cursorPosition[1] < this.gridSize[1] - 1) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                    this.cursorPosition[1] = Math.min(this.gridSize[1] - 1, this.cursorPosition[1] + 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.W:
                if (this.cursorPosition[0] > 0) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            case Direction.NW:
                if (this.cursorPosition[0] > 0 || this.cursorPosition[1] > 0) {
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                    this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                    this.cursorPosition[1] = Math.max(0, this.cursorPosition[1] - 1);
                    this.dirtyTiles.push([this.cursorPosition[0], this.cursorPosition[1]]);
                }
                break;
            default:
                return;
        }

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
        if (this.cursorPosition[0] === coord[0] && this.cursorPosition[1] === coord[1]) {
            this.display.draw(this.cursorPosition[0], this.cursorPosition[1], this.cursorCharacter, "rgba(255,255,0,1)", null);
        } else {
            this.display.draw(coord[0], coord[1], this.gameGrid[coord[0]][coord[1]].character, this.gameGrid[coord[0]][coord[1]].color, null);
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
