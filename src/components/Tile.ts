import * as _ from "lodash";
import { Constants, Direction } from "./constants";

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
    private color: string;
    private neighbors: TileType[];
    private decorated: boolean;
    private userSet: boolean; // true if the user designates this, false if generated from code
    private isBuilding: boolean; // true if this tile is part of a building
    private buildingChar: string; // character for the building at this tile (0-255)
    private buildingKey: string;

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
        return this.color;
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

    public getDrawData(coord: [number, number]) {
        switch (this.tileType) {
            case TileType.Wall:
                return [
                    coord[0],
                    coord[1],
                    [Tile.Floor.getCharacter(), this.getCharacter()],
                    [Tile.Floor.getColor(), this.getColor()],
                    ["transparent", "transparent"],
                ];
        }

        return [
            coord[0],
            coord[1],
            this.getCharacter(),
            this.getColor(),
            "transparent",
        ];
    }

    public setBuilding(key: string, char: string) {
        this.tileType = TileType.Building;
        this.isBuilding = true;
        this.buildingKey = key;
        this.buildingChar = char;
        this.character = `i${char}`;
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
            this.buildingChar = null;
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
                    this.character += String.fromCharCode(97 + _.random(opts.length - 1, false));
                }

                return true;
            case TileType.Floor:
                //no modifications needed if this is a floor
                this.character = `f${_.random(Constants.FLOOR_TILES.length - 1, false)}`;
                // this.character = "f1";
                break;
            case TileType.Empty:
                if (this.decorated) {
                    const target = Constants.DECORATOR_TILES[_.random(Constants.DECORATOR_TILES.length - 1, false)];
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
                // this.color = "transparent";
                this.color = "rgba(50, 50, 50, .2)";
                break;
            case TileType.Wall:
                this.color = "transparent";
                break;
            case TileType.Empty:
                this.color = "transparent";
                if (this.decorated) {
                    if (_.random(100, false) <= Constants.GRID_TILE_COLOR_PERCENT) {
                        this.color = Constants.GRID_TILE_DECORATED_COLORS[_.random(Constants.GRID_TILE_DECORATED_COLORS.length - 1, false)];
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
