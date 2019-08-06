import { BUILDINGS, DEFAULTS, DIRECTION, IBuildingData, IGridRange, MENU_ITEM, Point } from "../constants";
import { hideCursor, moveCursor, setCursorCharacter, showCursor } from "../redux/cursor/actions";
import store, { getAllStoreData } from "../redux/store";
import { Tile, TileType } from "../tile";

/**
 * Requires CAMERA
 */
export class GameCursor {
    //redux global
    mapSize: Point = null;
    gridSize: Point = null;
    camera: Point = null;

    //redux local
    cursorVisible: boolean = null;
    cursorRadius: number = null;
    cursorBuilding: boolean = null;

    //local
    cursorPosition: Point;
    character: string;
    color: string;
    buildingKey: MENU_ITEM;
    buildingRange: Point[];
    buildingTileMap: {
        [key: string]: {
            pos: Point,
            tile: IBuildingData,
        },
    };

    constructor() {
        this.character = DEFAULTS.CURSOR.CHAR;
        this.color = DEFAULTS.COLORS.CURSOR_DEFAULT;

        store.subscribe(this.getStoreData);
        this.getStoreData();

        this.cursorPosition = [
            Math.ceil((this.camera[0] + this.gridSize[0]) / 2.0),
            Math.ceil((this.camera[1] + this.gridSize[1]) / 2.0),
        ];

        store.dispatch(moveCursor(this.cursorPosition));
    }

    getStoreData = () => {
        const prevPos = this.cursorPosition != null ? this.cursorPosition.slice() : null;
        getAllStoreData(this, store);

        //update the building positions when the cursor moves if placing a building
        if (prevPos != null && this.cursorPosition != null &&
            (this.cursorPosition[0] !== prevPos[0] || this.cursorPosition[1] !== prevPos[1])) {
            if (this.cursorBuilding) {
                const xDelta = prevPos[0] - this.cursorPosition[0];
                const yDelta = prevPos[1] - this.cursorPosition[1];

                for (const coord of this.buildingRange) {
                    coord[0] += xDelta;
                    coord[1] += yDelta;
                }

                for (const key of Object.keys(this.buildingTileMap)) {
                    this.buildingTileMap[key].pos[0] += xDelta;
                    this.buildingTileMap[key].pos[1] += yDelta;
                }
            }
        }
    }

    getPosition = (): Point => {
        return this.cursorPosition ? this.cursorPosition.slice() as Point : null;
    }

    coordIsCursor = (coord: Point): boolean => {
        if (!this.cursorBuilding) {
            return coord[0] === this.cursorPosition[0] && coord[1] === this.cursorPosition[1];
        }
        for (const pos of this.buildingRange) {
            if (coord[0] === pos[0] && coord[1] === pos[1]) {
                return true;
            }
        }
        return false;
    }

    stopBuilding = () => {
        this.cursorBuilding = false;
        this.buildingKey = null;
        this.buildingRange = null;
        this.buildingTileMap = null;
    }

    setBuilding = (key: MENU_ITEM) => {
        const target = BUILDINGS[key];
        if (target == null || target.tiles == null || target.tiles.length === 0) {
            return;
        }
        this.cursorBuilding = true;
        this.buildingKey = key;
        this.buildingRange = [];
        this.buildingTileMap = {};

        const middle = Math.floor(target.tiles.length / 2);
        for (let x = 0; x < target.tiles.length; x++) {
            for (let y = 0; y < target.tiles[0].length; y++) {
                const thisX = this.cursorPosition[0] - middle + x;
                const thisY = this.cursorPosition[1] - middle + y;
                this.buildingRange.push([thisX, thisY]);
                this.buildingTileMap[`${x}:${y}`] = {
                    pos: [thisX, thisY],
                    tile: target.tiles[y][x],
                };
            }
        }

        this.cursorRadius = Math.floor(target.tiles.length / 2);
    }

    // setPosition = (pos: Point) => {
    //     if (this.cursorBuilding) {
    //         const xDelta = pos[0] - this.cursorPosition[0];
    //         const yDelta = pos[1] - this.cursorPosition[1];

    //         for (const coord of this.buildingRange) {
    //             coord[0] += xDelta;
    //             coord[1] += yDelta;
    //         }

    //         for (const key of Object.keys(this.buildingTileMap)) {
    //             this.buildingTileMap[key].pos[0] += xDelta;
    //             this.buildingTileMap[key].pos[1] += yDelta;
    //         }
    //     }

    //     // this.cursorPosition = [pos[0], pos[1]];
    // }

    getDrawData = (pos?: Point, impassable?: boolean) => {
        if (pos != null && this.cursorBuilding) {
            const targetX = pos[0] - this.cursorPosition[0] + this.cursorRadius;
            const targetY = pos[1] - this.cursorPosition[1] + this.cursorRadius;
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
        if (pos != null && pos.length === 2) {
            return [
                pos[0],
                pos[1],
                this.character,
                this.color,
                "transparent",
            ];
        }
        return [
            this.cursorPosition[0],
            this.cursorPosition[1],
            this.character,
            this.color,
            "transparent",
        ];
    }

    // getTileAtPosition = (pos: Point) => {
    //     return this.gameGrid[this.zLevel][pos[0]][pos[1]];
    // }

    // getTileAtCursor = (): Tile => {
    //     const pos = this.getCursorPosition();
    //     return this.getTileAtPosition(pos);
    // }

    hide = () => {
        // this.cursor.setHidden(true);
        // this.render();
        store.dispatch(hideCursor());
    }

    show = () => {
        // this.cursor.setHidden(false);
        // this.render();
        store.dispatch(showCursor());
    }

    moveCursor = (dir: DIRECTION, shiftPressed?: boolean) => {
        const pos = this.cursorPosition.slice() as Point;
        const distance = shiftPressed ? 10 : 1;

        switch (dir) {
            case DIRECTION.N:
                if (pos[1] - this.cursorRadius > 0) {
                    pos[1] = Math.max(this.cursorRadius, pos[1] - distance);
                }
                break;
            case DIRECTION.NE:
                if (pos[1] - this.cursorRadius > 0 ||
                    pos[0] + this.cursorRadius < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorRadius, pos[0] + distance);
                    pos[1] = Math.max(this.cursorRadius, pos[1] - distance);
                }
                break;
            case DIRECTION.E:
                if (pos[0] + this.cursorRadius < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorRadius + 0, pos[0] + distance);
                }
                break;
            case DIRECTION.SE:
                if (pos[0] + this.cursorRadius < this.mapSize[0] - 1 ||
                    pos[1] + this.cursorRadius < this.mapSize[1] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - this.cursorRadius, pos[0] + distance);
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorRadius, pos[1] + distance);
                }
                break;
            case DIRECTION.S:
                if (pos[1] + this.cursorRadius < this.mapSize[1] - 1) {
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorRadius, pos[1] + distance);
                }
                break;
            case DIRECTION.SW:
                if (pos[0] - this.cursorRadius > 0 ||
                    pos[1] + this.cursorRadius < this.mapSize[1] - 1) {
                    pos[0] = Math.max(this.cursorRadius, pos[0] - 1);
                    pos[1] = Math.min(this.mapSize[1] - 1 - this.cursorRadius, pos[1] + distance);
                }
                break;
            case DIRECTION.W:
                if (pos[0] - this.cursorRadius > 0) {
                    pos[0] = Math.max(this.cursorRadius, pos[0] - distance);
                }
                break;
            case DIRECTION.NW:
                if (pos[0] - this.cursorRadius > 0 ||
                    pos[1] - this.cursorRadius > 0) {
                    pos[0] = Math.max(this.cursorRadius, pos[0] - distance);
                    pos[1] = Math.max(this.cursorRadius, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        // this.moveCameraToIncludePoint(pos);
        this.moveCursorTo(pos);
    }

    /**
     * @deprecated use moveCursor
     */
    moveCursorOnGrid = (direction: DIRECTION, shiftPressed?: boolean) => {
        const pos = this.cursorPosition.slice() as Point;
        const offset = this.cursorRadius;
        const distance = shiftPressed ? 10 : 1;

        switch (direction) {
            case DIRECTION.N:
                if (pos[1] - offset > this.camera[1]) {
                    pos[1] = Math.max(this.camera[1] + offset, pos[1] - distance);
                }
                break;
            case DIRECTION.NE:
                if (pos[1] - offset > this.camera[1] ||
                    pos[0] + offset < this.camera[0] + this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.camera[0] + this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.max(this.camera[1] + offset, pos[1] - distance);
                }
                break;
            case DIRECTION.E:
                if (pos[0] + offset < this.camera[0] + this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.gridSize[0] - 1 - offset + this.camera[0], pos[0] + distance);
                }
                break;
            case DIRECTION.SE:
                if (pos[0] + offset < this.camera[0] + this.gridSize[0] - 1 ||
                    pos[1] + offset < this.camera[0] + this.gridSize[1] - 1) {
                    pos[0] = Math.min(this.camera[0] + this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.S:
                if (pos[1] + offset < this.camera[1] + this.gridSize[1] - 1) {
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.SW:
                if (pos[0] - offset > this.camera[0] ||
                    pos[1] + offset < this.camera[1] + this.gridSize[1] - 1) {
                    pos[0] = Math.max(this.camera[0] + offset, pos[0] - 1);
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.W:
                if (pos[0] - offset > this.camera[0]) {
                    pos[0] = Math.max(this.camera[0] + offset, pos[0] - distance);
                }
                break;
            case DIRECTION.NW:
                if (pos[0] - offset > this.camera[0] ||
                    pos[1] - offset > this.camera[1]) {
                    pos[0] = Math.max(this.camera[0] + offset, pos[0] - distance);
                    pos[1] = Math.max(this.camera[1] + offset, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        this.moveCursorTo(pos);
    }

    moveCursorTo = (targetPos: Point) => {
        if ((this.cursorPosition[0] === targetPos[0] && this.cursorPosition[1] === targetPos[1]) || //already there
            (targetPos[0] < 0 || targetPos[1] < 0 || //out of bounds
                targetPos[0] > this.mapSize[0] - 1 ||
                targetPos[1] > this.mapSize[1] - 1)) {
            return;
        }

        targetPos[0] = Math.max(this.cursorRadius, Math.min(this.mapSize[0] - 1 - this.cursorRadius, targetPos[0]));
        targetPos[1] = Math.max(this.cursorRadius, Math.min(this.mapSize[1] - 1 - this.cursorRadius, targetPos[1]));

        store.dispatch(moveCursor(targetPos));

        // if (this.designator.isDesignating()) {
        //     const range = this.designator.getRange(targetPos);
        //     for (let x = range.startX; x <= range.endX; x++) {
        //         for (let y = range.startY; y <= range.endY; y++) {
        //             this.designatorTiles.push([x, y]);
        //         }
        //     }
        // }

        // this.moveCameraToIncludePoint(targetPos);
        // this.render();
    }

    // setPaintOverwrite = (val: boolean) => {
    //     this.paintOverwrite = val;
    // }
}
