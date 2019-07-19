import * as _ from "lodash";
import { Constants, Direction, MenuItemId } from "./constants";

class Cursor {
    private position: [number, number];
    private character: string;
    private color: string;
    private building: boolean;
    private buildingKey: MenuItemId;
    private buildingRange: Array<[number, number]>;
    private buildingWalkable: string[][];
    private buildingTiles: string[][];
    private buildingTileMap: Array<{
        pos: [number, number],
        tile: string,
    }>;

    constructor(pos: [number, number] = [0, 0]) {
        this.character = ".";
        this.position = [pos[0], pos[1]];
        this.color = Constants.CURSOR_COLOR;
    }

    public getCharacter() {
        return this.character;
    }

    public getPosition(): [number, number] {
        return [this.position[0], this.position[1]];
    }

    public getRange(): Array<[number, number]> {
        if (!this.building) {
            return [this.position];
        }

        return this.buildingRange;
    }

    public getBuildingTiles() {
        return this.buildingTileMap;
    }

    public coordIsCursor(coord: [number, number]): boolean {
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
        this.buildingWalkable = null;
        this.buildingTiles = null;
        this.buildingRange = null;
        this.buildingTileMap = null;
    }

    public setBuilding(key: MenuItemId) {
        const target = Constants.BUILDING_TILE_MAP[key];
        if (target == null || target.walkable == null || target.walkable.length === 0) {
            return;
        }
        this.building = true;
        this.buildingKey = key;
        this.buildingRange = [];
        this.buildingWalkable = target.walkable;
        this.buildingTiles = target.tiles;
        this.buildingTileMap = [];

        const middle = Math.floor(target.walkable.length / 2);
        for (let x = 0; x < target.walkable.length; x++) {
            for (let y = 0; y < target.walkable[0].length; y++) {
                const thisX = this.position[0] - middle + x;
                const thisY = this.position[1] - middle + y;
                this.buildingRange.push([thisX, thisY]);
                this.buildingTileMap.push({
                    pos: [thisX, thisY],
                    tile: this.buildingTiles[y][x],
                });
            }
        }
    }

    public setPosition(pos: [number, number]) {
        //difference = pos - this.position
        if (this.building) {
            const xDelta = pos[0] - this.position[0];
            const yDelta = pos[1] - this.position[1];

            for (const coord of this.buildingRange) {
                coord[0] += xDelta;
                coord[1] += yDelta;
            }

            for (const map of this.buildingTileMap) {
                map.pos[0] += xDelta;
                map.pos[1] += yDelta;
            }
        }

        this.position = [pos[0], pos[1]];
    }

    public getRadius() {
        if (!this.building) {
            return 0;
        }

        return Math.floor(this.buildingWalkable.length / 2);
    }

    public getDrawData(pos?: [number, number]) {
        if (pos != null && this.building) {
            const targetX = pos[0] - this.position[0] + Math.floor(this.buildingWalkable.length / 2);
            const targetY = pos[1] - this.position[1] + Math.floor(this.buildingWalkable[0].length / 2);
            const passable = this.buildingWalkable[targetX][targetY];
            const color = passable === "1" ? Constants.CURSOR_PASSABLE_COLOR : Constants.CURSOR_IMPASSABLE_COLOR;
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
