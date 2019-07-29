// import * as _ from "lodash";
import { BUILDINGS, DEFAULTS, IBuildingData, MENU_ITEM, Point } from "./constants";

class Cursor {
    private position: Point;
    private character: string;
    private color: string;
    private building: boolean;
    private buildingKey: MENU_ITEM;
    private buildingRange: Point[];
    private buildingRadius: number;
    private buildingTileMap: {
        [key: string]: {
            pos: Point,
            tile: IBuildingData,
        },
    };

    constructor(pos: Point = [0, 0]) {
        this.character = ".";
        this.position = [pos[0], pos[1]];
        this.color = DEFAULTS.COLORS.CURSOR_DEFAULT;
    }

    public getCharacter() {
        return this.character;
    }

    public getPosition(): Point {
        return [this.position[0], this.position[1]];
    }

    public getRange(): Point[] {
        if (!this.building) {
            return [this.position];
        }

        return this.buildingRange;
    }

    public getBuildingTiles() {
        return this.buildingTileMap;
    }

    public coordIsCursor(coord: Point): boolean {
        if (!this.building) {
            return coord[0] === this.position[0] && coord[1] === this.position[1];
        }
        for (const pos of this.buildingRange) {
            if (coord[0] === pos[0] && coord[1] === pos[1]) {
                return true;
            }
        }
        return false;
    }

    public getColor() {
        return this.color;
    }

    public isBuilding() {
        return this.building;
    }

    public getBuildingKey() {
        return this.buildingKey;
    }

    public stopBuilding() {
        this.building = false;
        this.buildingKey = null;
        // this.buildingWalkable = null;
        // this.buildingTiles = null;
        this.buildingRange = null;
        this.buildingTileMap = null;
    }

    public setBuilding(key: MENU_ITEM) {
        const target = BUILDINGS[key];
        if (target == null || target.tiles == null || target.tiles.length === 0) {
            return;
        }
        this.building = true;
        this.buildingKey = key;
        this.buildingRange = [];
        this.buildingTileMap = {};

        const middle = Math.floor(target.tiles.length / 2);
        for (let x = 0; x < target.tiles.length; x++) {
            for (let y = 0; y < target.tiles[0].length; y++) {
                const thisX = this.position[0] - middle + x;
                const thisY = this.position[1] - middle + y;
                this.buildingRange.push([thisX, thisY]);
                this.buildingTileMap[`${x}:${y}`] = {
                    pos: [thisX, thisY],
                    tile: target.tiles[y][x],
                };
            }
        }

        this.buildingRadius = Math.floor(target.tiles.length / 2);
    }

    public setPosition(pos: Point) {
        if (this.building) {
            const xDelta = pos[0] - this.position[0];
            const yDelta = pos[1] - this.position[1];

            for (const coord of this.buildingRange) {
                coord[0] += xDelta;
                coord[1] += yDelta;
            }

            for (const key of Object.keys(this.buildingTileMap)) {
                this.buildingTileMap[key].pos[0] += xDelta;
                this.buildingTileMap[key].pos[1] += yDelta;
            }
        }

        this.position = [pos[0], pos[1]];
    }

    public getRadius() {
        if (!this.building) {
            return 0;
        }

        return this.buildingRadius;
    }

    public getDrawData(pos?: Point, impassable?: boolean) {
        if (pos != null && this.building) {
            const targetX = pos[0] - this.position[0] + this.buildingRadius;
            const targetY = pos[1] - this.position[1] + this.buildingRadius;
            const targetTile = this.buildingTileMap[`${targetX}:${targetY}`];
            let passable = true;
            if (targetTile != null && impassable !== true &&
                targetTile.tile != null && targetTile.tile.walkable === 0) {
                passable = false;
            }
            const color = impassable === true ? DEFAULTS.COLORS.CURSOR_INVALID :
                                     passable ? DEFAULTS.COLORS.CURSOR_PASSABLE :
                                                DEFAULTS.COLORS.CURSOR_IMPASSABLE;
            return [
                pos[0],
                pos[1],
                this.character,
                color,
                "transparent",
            ];
        }
        return [
            this.position[0],
            this.position[1],
            this.character,
            this.color,
            "transparent",
        ];
    }
}

export { Cursor };
