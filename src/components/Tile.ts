import * as _ from "lodash";
import { Constants } from "./constants";

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
    private neighbors: number;

    constructor(tile: TileType) {
        this.tileType = tile;
        this.color = "transparent";

        this.initByType();
    }

    public getCharacter() {
        return this.character;
    }

    public getColor() {
        return this.color;
    }

    public setType(type: TileType) {
        if (type === this.tileType) {
            return;
        }
        this.tileType = type;
        this.initByType();
    }

    private initByType() {
        switch (this.tileType) {
            case TileType.Floor:
                this.character = " ";
                this.color = "transparent";
                break;
            case TileType.Wall:
                this.character = " ";
                this.color = "transparent";
                break;
            case TileType.EmptyDecorated:
                const target = Constants.DECORATOR_TILES[_.random(Constants.DECORATOR_TILES.length - 1, false)];
                this.character = target.char;
                this.color = "transparent";
                if (target.colorize) {
                    if (_.random(100, false) <= Constants.GRID_TILE_COLOR_PERCENT) {
                        this.color = Constants.GRID_TILE_DECORATED_COLORS[_.random(Constants.GRID_TILE_DECORATED_COLORS.length - 1, false)];
                    }
                }
                break;
            case TileType.Empty:
            default:
                this.character = " ";
                this.color = "transparent";
                break;
        }
    }
}

export { Tile, TileType };
