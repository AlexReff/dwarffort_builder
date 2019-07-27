import { DIRECTION, IGridRange, MENU_ITEM, Point } from "../constants";
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

        this.cursor = new Cursor([
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ]);

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

    public moveCursor(dir: DIRECTION, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();
        const distance = shiftPressed ? 10 : 1;

        switch (dir) {
            case DIRECTION.N:
                if (pos[1] - offset > 0) {
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case DIRECTION.NE:
                if (pos[1] - offset > 0 ||
                    pos[0] + offset < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            case DIRECTION.E:
                if (pos[0] + offset < this.mapSize[0] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset + 0, pos[0] + distance);
                }
                break;
            case DIRECTION.SE:
                if (pos[0] + offset < this.mapSize[0] - 1 ||
                    pos[1] + offset < this.mapSize[1] - 1) {
                    pos[0] = Math.min(this.mapSize[0] - 1 - offset, pos[0] + distance);
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.S:
                if (pos[1] + offset < this.mapSize[1] - 1) {
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.SW:
                if (pos[0] - offset > 0 ||
                    pos[1] + offset < this.mapSize[1] - 1) {
                    pos[0] = Math.max(offset, pos[0] - 1);
                    pos[1] = Math.min(this.mapSize[1] - 1 - offset, pos[1] + distance);
                }
                break;
            case DIRECTION.W:
                if (pos[0] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                }
                break;
            case DIRECTION.NW:
                if (pos[0] - offset > 0 ||
                    pos[1] - offset > 0) {
                    pos[0] = Math.max(offset, pos[0] - distance);
                    pos[1] = Math.max(offset, pos[1] - distance);
                }
                break;
            default:
                return;
        }

        this.moveCameraToIncludePoint(pos);
        this.moveCursorTo(pos);
    }

    /**
     * Moves the cursor in the specified DIRECTION,
     * Locked in the visible view
     * Does not move camera
     */
    public moveCursorOnGrid(direction: DIRECTION, shiftPressed?: boolean) {
        const pos = this.cursor.getPosition();
        const offset = this.cursor.getRadius();
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

        this.moveCameraToIncludePoint(targetPos);
        this.render();
    }

    public moveCameraToIncludePoint = (pos: Point) => {
        //for each NESW DIRECTION, move camera in that DIRECTION if needed
        const radius = this.cursor.getRadius();
        if (pos[0] < 0 || pos[1] < 0 ||
            pos[0] > this.mapSize[0] ||
            pos[1] > this.mapSize[1]) {
            return;
        }
        if (pos[0] - radius < this.camera[0]) {
            //MOVE NORTH
            const dist = Math.ceil((this.camera[0] - pos[0] + radius) / 10) * 10;
            const toMove = Math.max(0, this.camera[0] - dist);
            this.camera[0] = toMove;
        } else if (pos[0] + radius >= this.camera[0] + this.gridSize[0]) {
            //MOVE SOUTH
            const dist = Math.ceil((pos[0] + radius - this.camera[0] - (this.gridSize[0] - 1)) / 10) * 10;
            const toMove = Math.min(this.mapSize[0] - this.gridSize[0], this.camera[0] + dist);
            this.camera[0] = toMove;
        }

        if (pos[1] - radius < this.camera[1]) {
            //MOVE WEST
            const dist = Math.ceil((this.camera[1] - pos[1] + radius) / 10) * 10;
            const toMove = Math.max(0, this.camera[1] - dist);
            this.camera[1] = toMove;
        } else if (pos[1] + radius >= this.camera[1] + this.gridSize[1]) {
            //MOVE EAST
            const dist = Math.ceil((pos[1] + radius - this.camera[1] - (this.gridSize[1] - 1)) / 10) * 10;
            const toMove = Math.min(this.mapSize[1] - this.gridSize[1], this.camera[1] + dist);
            this.camera[1] = toMove;
        }
    }

    /**
     * Called when a designation finishes, updates the relevant tiles to the new type
     */
    protected designateRange = (range: IGridRange, item: MENU_ITEM) => {
        //if we are mining floors, convert all empty neighbors to walls
        switch (item) {
            case MENU_ITEM.remove:
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
            case MENU_ITEM.wall:
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
            case MENU_ITEM.mine:
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
