// import * as _ from "lodash";
import { IBuildingData } from "./buildings";
import { Constants, Direction, Point } from "./constants";
import RNG from "./rot/rng";

enum TileType {
    Empty,
    Wall,
    Floor,
    Building,
}

class Tile {
    public static Floor = new Tile(TileType.Floor);
    public static Empty = new Tile(TileType.Empty);
    public static Wall = new Tile(TileType.Wall);

    private tileType: TileType;
    private character: string;
    private fgColor: string;
    private bgColor: string;

    private buildingKey: string;
    private buildingData: IBuildingData;

    private neighbors: TileType[];
    private decorated: boolean;
    private userSet: boolean; // true if the user designates this, false if generated from code
    private isBuilding: boolean; // true if this tile is part of a building

    constructor(tile: TileType, decorate?: boolean) {
        this.tileType = tile;
        this.neighbors = new Array(4);
        this.userSet = false;
        this.isBuilding = false;
        this.decorated = decorate === true;
        this.init();
    }

    public getCharacter() {
        return this.character;
    }

    public getColor() {
        //return this.buildingData.fg;
        return this.fgColor;
    }

    public getBgColor() {
        // return this.buildingData.bg;
        return this.bgColor;
    }

    public getType() {
        return this.tileType;
    }

    public getUserSet() {
        return this.userSet;
    }

    public getBuildingName() {
        return Constants.MENU_DICTIONARY[this.buildingKey].text;
    }

    public getDrawData(coord: Point) {
        switch (this.tileType) {
            case TileType.Wall:
                return [
                    coord[0],
                    coord[1],
                    [Tile.Floor.getCharacter(), this.character],
                    [Tile.Floor.getColor(), this.fgColor],
                    ["transparent", this.bgColor],
                ];
        }

        return [
            coord[0],
            coord[1],
            this.character,
            this.fgColor,
            this.bgColor,
        ];
    }

    public setBuilding(key: string, data: IBuildingData) {
        this.tileType = TileType.Building;
        this.isBuilding = true;
        this.buildingKey = key;

        if (data != null && data.char != null) {
            this.buildingData = {
                char: data.char,
                fg: data.fg,
                bg: data.bg,
                walkable: data.walkable,
            };
            this.character = `i${data.char}`;
            this.fgColor = data.fg || "transparent";
            this.bgColor = data.bg || "transparent";
        } else {
            this.buildingData = {
                char: "0",
                fg: null,
                bg: null,
                walkable: 1,
            };
            this.character = `i0`;
            this.fgColor = "transparent";
            this.bgColor = "transparent";
        }
    }

    /**
     * Returns
     * @param pos
     * @param type
     * @returns {true} if this character has changed, false otherwise
     */
    public setNeighbor(pos: Direction, type: TileType): boolean {
        if (pos % 2 === 1) {
            return false;
        }
        if (this.neighbors[pos / 2] === type) {
            return false;
        }

        this.neighbors[pos / 2] = type;

        //recalculate current character, if needed
        return this.computeCharacter();
    }

    public setType(type: TileType, fromUser?: boolean): boolean {
        if (fromUser === true) {
            this.userSet = true;
        } else if (fromUser === false) {
            this.userSet = false;
        }
        if (type === this.tileType) {
            return false;
        }
        if (type !== TileType.Building) {
            this.isBuilding = false;
            this.buildingKey = null;
            this.buildingData = null;
            // this.buildingChar = null;
        }
        this.tileType = type;
        this.init();
        return true;
    }

    private computeCharacter() {
        const prevChar = this.character;
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
                    if (this.character.indexOf("w") === 0) { //if this tile was already a wall
                        const matches = this.character.match(/\d+/g);
                        if (matches && matches.length > 0) { //get which type of wall
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
                    this.character += String.fromCharCode(97 + RNG.getUniformInt(0, opts.length - 1));
                }

                return true;
            case TileType.Floor:
                //no modifications needed if this is a floor
                this.character = `f${RNG.getUniformInt(0, Constants.FLOOR_TILES.length - 1)}`;
                // this.character = "f1";
                break;
            case TileType.Empty:
                if (this.decorated) {
                    const target = Constants.DECORATOR_TILES[RNG.getUniformInt(0, Constants.DECORATOR_TILES.length - 1)];
                    this.character = target.char;
                } else {
                    this.character = " ";
                }
                break;
            default:
                break;
        }

        return this.character !== prevChar;
    }

    private init() {
        switch (this.tileType) {
            case TileType.Floor:
                this.fgColor = "rgba(50, 50, 50, .2)";
                this.bgColor = "transparent";
                break;
            case TileType.Wall:
                this.fgColor = "transparent";
                this.bgColor = "transparent";
                break;
            case TileType.Empty:
                this.fgColor = "transparent";
                this.bgColor = "transparent";
                if (this.decorated) {
                    if (RNG.getUniformInt(0, 100) <= Constants.GRID_TILE_COLOR_PERCENT) {
                        this.fgColor = Constants.GRID_TILE_DECORATED_COLORS[RNG.getUniformInt(0, Constants.GRID_TILE_DECORATED_COLORS.length - 1)];
                    }
                }

                break;
            default:
                break;
        }

        this.computeCharacter();
    }
}

export { Tile, TileType };
