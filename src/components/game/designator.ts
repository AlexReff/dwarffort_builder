import { DEFAULTS, DIRECTION, IBuildingData, IGridRange, MENU_ITEM, Point } from "../constants";
import { hideCursor, moveCursor, setCursorCharacter, showCursor } from "../redux/cursor/actions";
import { designatorEnd, designatorStart } from "../redux/designator/actions";
import store, { getAllStoreData, getUpdatedStoreData } from "../redux/store";
import { Tile, TileType } from "../tile";
import Util from "../util";

/**
 * Requires CAMERA, CURSOR
 */
export class GameDesignator {
    //redux read-only
    mapSize: Point;
    gridSize: Point;
    camera: Point;
    cursorRadius: number;
    cursorPosition: Point;
    currentMenuItem: MENU_ITEM;

    //redux
    isDesignating: boolean;
    designatorStart: Point;
    designatorRange: IGridRange;

    //local
    designatorTiles: Point[];

    constructor() {
        store.subscribe(this.getStoreData);

        this.designatorTiles = [];
        this.isDesignating = false;
        this.designatorStart = null;
    }

    getStoreData = () => {
        const oldData = getUpdatedStoreData(this, store);

        if (typeof oldData.cursorPosition !== "undefined") {
            if (this.isDesignating) {
                const range = this.designatorRange;
                this.designatorTiles = [];
                for (let x = range.startX; x <= range.endX; x++) {
                    for (let y = range.startY; y <= range.endY; y++) {
                        this.designatorTiles.push([x, y]);
                    }
                }
            }
        }
        // const newState = store.getState();
        // if (newState.designator.isDesignating && (
        //     newState.cursor.cursorPosition[0] !== this.cursorPosition[0] ||
        //     newState.cursor.cursorPosition[1] !== this.cursorPosition[1]
        // )) {
        //     const range = this.designatorRange; // Util.getDesignatorRange(newState.cursor.cursorPosition);
        //     this.designatorTiles = [];
        //     for (let x = range.startX; x <= range.endX; x++) {
        //         for (let y = range.startY; y <= range.endY; y++) {
        //             this.designatorTiles.push([x, y]);
        //         }
        //     }
        // }

        // getAllStoreData(this, store);

        // this.camera = [newState.camera.camera[0], newState.camera.camera[1]];
        // this.gridSize = [newState.camera.gridSize[0], newState.camera.gridSize[1]];
        // this.mapSize = [newState.camera.mapSize[0], newState.camera.mapSize[1]];
        // this.cursorPosition = [newState.cursor.cursorPosition[0], newState.cursor.cursorPosition[1]];
        // this.cursorRadius = newState.cursor.cursorRadius;
        // this.isDesignating = newState.designator.isDesignating;
        // this.designationStart = newState.designator.designatorStart;
    }

    handleDesignation = () => {
        if (this.isDesignating) {
            this.finishDesignate();
        } else {
            this.beginDesignate();
        }
    }

    finishDesignate = () => {
        // const cursorPos = this.cursor.getPosition();
        // const range = this.designator.getRange(cursorPos);

        // this.designateRange(this.designatorRange, this.currentMenuItem);

        // this.designator.endDesignating();
        this.endDesignating();
        this.designatorTiles = [];
        // this.render();
    }

    getDrawData = (coord: Point) => {
        return [
            coord[0],
            coord[1],
            ",",
            coord[0] === this.designatorStart[0] && coord[1] === this.designatorStart[1] ? "rgba(28, 68, 22, .5)" : "rgba(72, 36, 12, .3)",
            "transparent",
        ];
    }

    /**
     * @deprecated use Util.getDesignatorRange() instead
     */
    getRange = (): IGridRange => {
        const startX = Math.min(this.designatorStart[0], this.cursorPosition[0]);
        const endX = Math.max(this.designatorStart[0], this.cursorPosition[0]);
        const startY = Math.min(this.designatorStart[1], this.cursorPosition[1]);
        const endY = Math.max(this.designatorStart[1], this.cursorPosition[1]);

        return {
            startX,
            endX,
            startY,
            endY,
        };
    }

    // startDesignating = (pos: Point) => {
    //     // this.designationStart = [pos[0], pos[1]];
    //     // this.designating = true;
    //     store.dispatch(designatorStart(pos));
    // }

    endDesignating = () => {
        store.dispatch(designatorEnd());
    }

    // isDesignating = () => {
    //     return this.designator.isDesignating();
    // }

    beginDesignate = () => {
        // const pos = this.cursor.getPosition();
        const pos = this.cursorPosition;
        // this.designator.startDesignating(pos);
        // this.startDesignating(pos);
        store.dispatch(designatorStart(pos));
        this.designatorTiles = [[pos[0], pos[1]]];
        // this.renderPosition(pos);
    }

    cancelDesignate = () => {
        // this.designator.endDesignating();
        // this.endDesignating();
        store.dispatch(designatorEnd());
        this.designatorTiles = [];
        // this.render();
    }

    // /**
    //  * Called when a designation finishes, updates the relevant tiles to the new type
    //  */
    // designateRange = (range: IGridRange, item: MENU_ITEM) => {
    //     //if we are mining floors, convert all empty neighbors to walls
    //     switch (item) {
    //         case MENU_ITEM.remove:
    //             for (let x = range.startX; x <= range.endX; x++) {
    //                 for (let y = range.startY; y <= range.endY; y++) {
    //                     if (Util.coordIsBuilding([x, y])) {
    //                         //skip this
    //                         continue;
    //                     }
    //                     if (this.setTile([x, y], TileType.Empty, false)) {
    //                         this.dirtyTiles.push([x, y]);
    //                     }
    //                 }
    //             }
    //             break;
    //         case MENU_ITEM.wall:
    //             // Just need to make walls
    //             for (let x = range.startX; x <= range.endX; x++) {
    //                 for (let y = range.startY; y <= range.endY; y++) {
    //                     if (Util.coordIsBuilding([x, y])) {
    //                         //skip this
    //                         continue;
    //                     }
    //                     if (this.setTile([x, y], TileType.Wall, true)) {
    //                         this.dirtyTiles.push([x, y]);
    //                     }
    //                 }
    //             }
    //             break;
    //         case MENU_ITEM.mine:
    //             // make everything highlighted a floor
    //             for (let x = range.startX; x <= range.endX; x++) {
    //                 for (let y = range.startY; y <= range.endY; y++) {
    //                     if (Util.coordIsBuilding([x, y])) {
    //                         //skip this
    //                         continue;
    //                     }
    //                     if (this.setTile([x, y], TileType.Floor, true)) {
    //                         this.dirtyTiles.push([x, y]);
    //                     }
    //                 }
    //             }
    //             // make all neighbors that are EMPTY into WALLs
    //             const neighbors = this.getNeighborsOfRange(range);
    //             neighbors.forEach((neighbor) => {
    //                 if (Util.coordIsBuilding(neighbor)) {
    //                     //skip this
    //                     return;
    //                 }
    //                 const tile = this.gameGrid[this.zLevel][neighbor[0]][neighbor[1]];
    //                 if (tile.isUserSet()) {
    //                     //do not touch this tile
    //                 } else {
    //                     if (tile.getType() === TileType.Empty) {
    //                         tile.setType(TileType.Wall, false);
    //                         this.dirtyTiles.push([neighbor[0], neighbor[1]]);
    //                     }
    //                 }
    //             });
    //             break;
    //         default:
    //             return;
    //     }

    //     this.populateAllNeighbors();
    // }
}
