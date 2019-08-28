// import * as _ from "lodash";
import { BUILDINGS, DEC_TILES, DEC_TILES_COLORS, DIRECTION, FLOOR_TILES, IBuildingTileData, MENU, Point, WALL_TILES } from "./../constants";
import RNG from "./../rot/rng";

enum TileType {
    Empty,
    Wall,
    Floor,
    Building,
}

class Tile {
    static Floor = new Tile(TileType.Floor);
    static Empty = new Tile(TileType.Empty);
    static Wall = new Tile(TileType.Wall);

    private tileType: TileType;
    private character: string;
    private fgColor: string;
    private bgColor: string;

    private buildingKey: string;
    private buildingData: IBuildingTileData;

    private position: Point;

    private neighbors: TileType[];
    private decorated: boolean;
    private userSet: boolean; // true if the user designates this, false if generated from code
    private building: boolean; // true if this tile is part of a building

    constructor(tile: TileType, point?: Point, decorate?: boolean) {
        this.tileType = tile;
        this.neighbors = new Array(4);
        this.userSet = false;
        this.building = false;
        this.decorated = decorate === true;
        if (point && point.length === 2) {
            this.position = [point[0], point[1]];
        }
        this.init();
    }

    getCharacter = () => {
        return this.character;
    }

    getBuildingKey = () => {
        return this.buildingKey;
    }

    getBuildingData = () => {
        return this.buildingData;
    }

    getColor = () => {
        return this.fgColor;
    }

    getPosition = () => {
        return [this.position[0], this.position[1]];
    }

    getBgColor = () => {
        return this.bgColor;
    }

    getType = () => {
        return this.tileType;
    }

    isUserSet = () => {
        return this.userSet;
    }

    getBuildingName = () => {
        return BUILDINGS.IDS[this.buildingKey].display_name;
    }

    isBuilding = () => {
        return this.building;
    }

    isBuildable = (strictMode?: boolean) => {
        const isBldg = this.isBuilding();

        if (isBldg) {
            return false;
        }

        if (strictMode === true) {
            return this.getType() === TileType.Floor;
        }

        return true;
    }

    getDrawData = (coord: Point) => {
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

    setBuilding = (key: string, data: IBuildingTileData) => {
        this.tileType = TileType.Building;
        this.building = true;
        this.buildingKey = key;

        if (data != null && data.char != null) {
            this.buildingData = {
                char: data.char,
                fg: data.fg,
                bg: data.bg,
                walkable: data.walkable,
            };
            this.character = `i${data.char}`;
            this.updateColorsFromBuilding();
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
    setNeighbor = (pos: DIRECTION, type: TileType): boolean => {
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

    setType = (type: TileType, fromUser?: boolean): boolean => {
        if (fromUser === true) {
            this.userSet = true;
        } else if (fromUser === false) {
            this.userSet = false;
        }
        if (type === this.tileType) {
            return false;
        }
        if (type !== TileType.Building) {
            this.building = false;
            this.buildingKey = null;
            this.buildingData = null;
            // this.buildingChar = null;
        }
        this.tileType = type;
        this.init();
        return true;
    }

    private updateColorsFromBuilding = () => {
        this.fgColor = this.buildingData.fg || "transparent";
        this.bgColor = this.buildingData.bg || "transparent";
        const fgStart = this.fgColor.indexOf("(");
        const bgStart = this.bgColor.indexOf("(");
        const fgEnd = this.fgColor.indexOf(")");
        const bgEnd = this.bgColor.indexOf(")");
        if (fgStart !== -1 && fgEnd !== -1) {
            this.fgColor = `rgba(${this.fgColor.substr(fgStart + 1, fgEnd)}, .3)`;
        }
        if (bgStart !== -1 && bgEnd !== -1) {
            this.bgColor = `rgba(${this.bgColor.substr(bgStart + 1, bgEnd)}, .4)`;
        }
    }

    private computeCharacter = () => {
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

                const opts = WALL_TILES[flags];
                if (opts.length > 1) {
                    this.character += String.fromCharCode(97 + RNG.getUniformInt(0, opts.length - 1));
                }

                return true;
            case TileType.Floor:
                this.character = `f${RNG.getUniformInt(0, FLOOR_TILES.length - 1)}`;
                break;
            case TileType.Empty:
                if (this.decorated) {
                    this.character = `z${RNG.getUniformInt(0, DEC_TILES.length - 1)}`;
                } else {
                    this.character = " ";
                }
                break;
            default:
                break;
        }

        return this.character !== prevChar;
    }

    private init = () => {
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
                    if (RNG.getUniformInt(0, 100) <= 50) {
                        this.fgColor = DEC_TILES_COLORS[RNG.getUniformInt(0, DEC_TILES_COLORS.length - 1)];
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
