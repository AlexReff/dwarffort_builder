import * as _ from "lodash";
import { Constants, Direction } from "./constants";

enum TileType {
    Empty,
    EmptyDecorated,
    Wall,
    Floor,
}

class Tile {
    public static Floor = (): Tile => {
        return new Tile(TileType.Floor);
    }
    public static Empty = (): Tile => {
        return new Tile(TileType.Empty);
    }
    public static EmptyDecorated = (): Tile => {
        return new Tile(TileType.EmptyDecorated);
    }
    public static Wall = (): Tile => {
        return new Tile(TileType.Wall);
    }

    private tileType: TileType;
    private character: string;
    private color: string;
    private neighbors: TileType[];

    constructor(tile: TileType) {
        this.neighbors = new Array(4);
        this.initByType(tile);
    }

    public getCharacter() {
        return this.character;
    }

    public getColor() {
        return this.color;
    }

    public getType() {
        return this.tileType;
    }

    /**
     * Returns
     * @param pos
     * @param type
     * @returns {true} if this character has changed, false otherwise
     */
    public setNeighbor(pos: Direction, type: TileType): boolean {

        if (this.neighbors[pos / 2] === type) {
            return false;
        }

        this.neighbors[pos / 2] = type;

        //recalculate current character, if needed
        return this.computeCharacter();
    }

    public setType(type: TileType) {
        if (type === this.tileType) {
            return;
        }
        this.initByType(type);
    }

    private computeCharacter() {
        const prevChar = this.character;
        //gets the character, stored in this.character
        switch (this.tileType) {
            case TileType.Wall:
                let flags = 0;
                for (let i = 0; i < this.neighbors.length; i++) {
                    if (this.neighbors[i] === TileType.Wall) {
                        // tslint:disable-next-line: no-bitwise
                        flags = flags | Math.pow(2, i);
                    }
                }

                if (this.character != null) {
                    if (this.character.indexOf("w") === 0) {
                        const matches = this.character.match(/\d+/g);
                        if (matches && matches.length > 0) {
                            const prevNum = matches[0];
                            if (prevNum === flags.toString(10)) {
                                //nothing is changing, do not update the variant or change the tile
                                return false;
                            }
                        }
                    }
                }

                this.character = "w" + flags.toString(10);

                const opts = Constants.WALL_TILES[flags];
                if (opts.length > 1) {
                    this.character += String.fromCharCode(97 + _.random(opts.length - 1, false));
                }

                return true;
            case TileType.Floor:
                //no modifications needed if this is a floor
                // this.character = `f${_.random(Constants.FLOOR_TILES.length - 1, false)}`;
                this.character = "f2";
                break;
            case TileType.Empty:
                this.character = " ";
                break;
            case TileType.EmptyDecorated:
                const target = Constants.DECORATOR_TILES[_.random(Constants.DECORATOR_TILES.length - 1, false)];
                this.character = target.char;
                // for (const i of this.neighbors) {
                //     if (i === TileType.Wall) {
                //         //swap to floor?
                //         this.initByType(TileType.Floor);
                //         return true;
                //     }
                // }
                break;
            default:
                break;
        }

        return this.character !== prevChar;
    }

    private initByType(type: TileType) {
        this.tileType = type;

        switch (this.tileType) {
            case TileType.Floor:
                this.color = "transparent";
                break;
            case TileType.Wall:
                this.color = "transparent";
                break;
            case TileType.EmptyDecorated:
                this.color = "transparent";
                if (_.random(100, false) <= Constants.GRID_TILE_COLOR_PERCENT) {
                    this.color = Constants.GRID_TILE_DECORATED_COLORS[_.random(Constants.GRID_TILE_DECORATED_COLORS.length - 1, false)];
                }
                break;
            case TileType.Empty:
            default:
                this.color = "transparent";
                break;
        }

        this.computeCharacter();
    }
}

export { Tile, TileType };
