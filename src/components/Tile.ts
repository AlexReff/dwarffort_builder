import * as _ from "lodash";
import { Constants } from "./constants";

enum TileItem {
    Empty,
    EmptyDecorated,
    Wall,
    Floor,
}

class Tile {
    public static Floor: Tile = new Tile(TileItem.Floor);
    public static Wall: Tile = new Tile(TileItem.Wall);
    public static Empty: Tile = new Tile(TileItem.Empty);
    // public static EmptyDecorated: Tile = new Tile(TileItem.EmptyDecorated, true);

    public tile: TileItem;
    public character: string;
    public color: string;

    constructor(tile: TileItem) {
        this.tile = tile;

        switch (this.tile) {
            case TileItem.Floor:
                break;
            case TileItem.Wall:
                break;
            case TileItem.EmptyDecorated:
                const target = Constants.DECORATOR_TILES[_.random(Constants.DECORATOR_TILES.length - 1, false)];
                this.character = target.char;
                // if (target.colorize) {
                //     if (_.random(100, false) <= Constants.GRID_TILE_COLOR_PERCENT) {
                //         this.color = Constants.GRID_TILE_DECORATED_COLORS[_.random(Constants.GRID_TILE_DECORATED_COLORS.length - 1, false)];
                //     }
                // }
                break;
            case TileItem.Empty:
            default:
                this.character = " ";
                break;
        }
    }
}

export { Tile, TileItem };
