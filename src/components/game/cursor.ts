import { Direction, IGridRange, MenuItemId, Point } from "../constants";
import { Cursor } from "../cursor";
import { Designator } from "../designator";
import { Tile, TileType } from "../tile";
import { GameCamera } from "./camera";

/**
 * Requires CAMERA
 */
export class GameCursor extends GameCamera {
    protected cursor: Cursor;
    protected designator: Designator;
    protected designatorTiles: Point[];

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);
        this.cursor = new Cursor(this.center);
        this.designator = new Designator();
        this.designatorTiles = [];
    }

    public getTileAtCursor = (): Tile => {
        const pos = this.cursor.getPosition();
        return this.gameGrid[this.zLevel][pos[0]][pos[1]];
    }

    public isDesignating() {
        return this.designator.isDesignating();
    }

    public beginDesignate() {
        const pos = this.cursor.getPosition();
        this.designator.startDesignating(pos);
        this.designatorTiles.push([pos[0], pos[1]]);
        this.renderPosition(pos);
    }

    public cancelDesignate() {
        this.designator.endDesignating();
        this.designatorTiles = [];
        this.render();
    }

    public moveCursor(direction: Direction, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();
        const distance = shiftPressed ? 10 : 1;

        /**
         * Current behavior: clamps at visible blocks
         * New behavior: moves correct amount, adjusts camera as needed
         */
        switch (direction) {
            case Direction.N:
                if (pos[1] - offset > 0) {
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case Direction.NE:
                if (pos[1] - offset > 0 ||
                    pos[0] + offset < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case Direction.E:
                if (pos[0] + offset < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset + 0, pos[0] + distance);
                }
                break;
            case Direction.SE:
                if (pos[0] + offset < this.mapSize[0] - 1 ||
                    pos[1] + offset < this.mapSize[1] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.S:
                if (pos[1] + offset < this.mapSize[1] - 1) {
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.SW:
                if (pos[0] - offset > 0 ||
                    pos[1] + offset < this.mapSize[1] - 1) {
                    pos[0] = Math.max(offset, pos[0] - 1);
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.W:
                if (pos[0] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                }
                break;
            case Direction.NW:
                if (pos[0] - offset > 0 ||
                    pos[1] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        this.moveCursorTo(pos);
    }

    /**
     * Moves the cursor in the specified direction,
     * Locked in the visible view
     * Does not move camera
     */
    public moveCursorOnGrid(direction: Direction, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();
        const distance = shiftPressed ? 10 : 1;

        switch (direction) {
            case Direction.N:
                if (pos[1] - offset > this.camera[1]) {
                    pos[1] = Math.max(this.camera[1] + offset, pos[1] - distance);
                }
                break;
            case Direction.NE:
                if (pos[1] - offset > this.camera[1] ||
                    pos[0] + offset < this.camera[0] + this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.camera[0] + this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.max(this.camera[1] + offset, pos[1] - distance);
                }
                break;
            case Direction.E:
                if (pos[0] + offset < this.camera[0] + this.gridSize[0] - 1) {
                    pos[0] = Math.min(this.gridSize[0] - 1 - offset + this.camera[0], pos[0] + distance);
                }
                break;
            case Direction.SE:
                if (pos[0] + offset < this.camera[0] + this.gridSize[0] - 1 ||
                    pos[1] + offset < this.camera[0] + this.gridSize[1] - 1) {
                    pos[0] = Math.min(this.camera[0] + this.gridSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.S:
                if (pos[1] + offset < this.camera[1] + this.gridSize[1] - 1) {
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.SW:
                if (pos[0] - offset > this.camera[0] ||
                    pos[1] + offset < this.camera[1] + this.gridSize[1] - 1) {
                    pos[0] = Math.max(this.camera[0] + offset, pos[0] - 1);
                    pos[1] = Math.min(this.camera[1] + this.gridSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case Direction.W:
                if (pos[0] - offset > this.camera[0]) {
                    pos[0] = Math.max(this.camera[0] + offset, pos[0] - distance);
                }
                break;
            case Direction.NW:
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

    public moveCursorTo(targetPos: Point) {
        // TODO: Update to move camera if neeeded
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();

        if ((pos[0] === targetPos[0] && pos[1] === targetPos[1]) || //already there
            (targetPos[0] < 0 || targetPos[1] < 0 || //out of bounds
                targetPos[0] > this.gameGrid[this.zLevel].length - 1 ||
                targetPos[1] > this.gameGrid[this.zLevel][0].length - 1)) {
            return;
        }

        targetPos[0] = Math.max(offset, Math.min(this.gameGrid[this.zLevel].length - 1 - offset, targetPos[0]));
        targetPos[1] = Math.max(offset, Math.min(this.gameGrid[this.zLevel][0].length - 1 - offset, targetPos[1]));

        this.cursor.setPosition(targetPos);

        if (this.designator.isDesignating()) {
            const range = this.designator.getRange(targetPos);
            for (let x = range.startX; x <= range.endX; x++) {
                for (let y = range.startY; y <= range.endY; y++) {
                    this.designatorTiles.push([x, y]);
                }
            }
        }

        this.render();
    }

    /**
     * Called when a designation finishes, updates the relevant tiles to the new type
     */
    protected designateRange = (range: IGridRange, item: MenuItemId) => {
        //if we are mining floors, convert all empty neighbors to walls
        switch (item) {
            case MenuItemId.remove:
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Empty, false)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MenuItemId.wall:
                // Just need to make walls
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Wall, true)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                break;
            case MenuItemId.mine:
                // make everything highlighted a floor
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        if (this.coordIsBuilding([x, y])) {
                            //skip this
                            continue;
                        }
                        if (this.setTile([x, y], TileType.Floor, true)) {
                            this.dirtyTiles.push([x, y]);
                        }
                    }
                }
                // make all neighbors that are EMPTY into WALLs
                const neighbors = this.getNeighborsOfRange(range);
                neighbors.forEach((neighbor) => {
                    if (this.coordIsBuilding(neighbor)) {
                        //skip this
                        return;
                    }
                    const tile = this.gameGrid[this.zLevel][neighbor[0]][neighbor[1]];
                    if (tile.getUserSet()) {
                        //do not touch this tile
                    } else {
                        if (tile.getType() === TileType.Empty) {
                            tile.setType(TileType.Wall, false);
                            this.dirtyTiles.push([neighbor[0], neighbor[1]]);
                        }
                    }
                });
                break;
            default:
                return;
        }

        this.populateAllNeighbors();
    }
}
