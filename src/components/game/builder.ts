import { BUILDINGS, MENU_ITEM, Point } from "../constants";
import { TileType } from "../tile";
import { GameCursor } from "./cursor";

/**
 * Requires CAMERA, CURSOR
 */
export class GameBuilder extends GameCursor {
    protected buildings: {
        [key: string]:
        {
            buildingKey: MENU_ITEM,
            buildingCenter: Point,
        },
    };

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);
        this.buildings = {};
    }

    /**
     * Handles enter key presses + right mouse clicks
     * @returns True if we need to un-set the highlightedMenuItem in index.tsx
     */
    handleEnterKey = (highlightedMenuItem?: MENU_ITEM): boolean => {
        if (highlightedMenuItem == null) {
            return;
        }
        if (this.cursor.isBuilding()) {
            return this.tryPlaceBuilding();
        } else {
            this.handleDesignation(highlightedMenuItem);
            return false;
        }
    }

    /**
     * Paints the current menu item at mouse position
     * @returns {true} if the highlighted menu item should be reset
     */
    paint = (highlightedMenuItem?: MENU_ITEM) => {
        if (this.cursor.isBuilding()) {
            return this.tryPlaceBuilding();
        } else if (highlightedMenuItem != null && highlightedMenuItem.length > 0) {
            const pos = this.cursor.getPosition();
            this.designateRange({ startX: pos[0], endX: pos[0], startY: pos[1], endY: pos[1] }, highlightedMenuItem);
            this.render();
            // switch (highlightedMenuItem) {
            //     case MENU_ITEM.remove:
            //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
            //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Empty);
            //             this.updateNeighborhood(pos);
            //         }
            //         break;
            //     case MENU_ITEM.wall:
            //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
            //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Wall, true);
            //             this.updateNeighborhood(pos);
            //         }
            //         break;
            //     case MENU_ITEM.mine:
            //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
            //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Floor, true);
            //             this.updateNeighborhood(pos);
            //         }
            //         break;
            //     default:
            //         return;
            // }
        }

        return false;
    }

    stopBuilding = () => {
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
    }

    isBuilding = () => {
        return this.cursor.isBuilding();
    }

    setCursorToBuilding = (e: MENU_ITEM) => {
        const target = BUILDINGS[e];
        if (target == null) {
            this.cursor.stopBuilding();
            return;
        }

        this.cursor.setBuilding(e);
        this.render();
    }

    handleDesignation = (highlightedMenuItem: MENU_ITEM) => {
        if (this.designator.isDesignating()) {
            this.finishDesignate(highlightedMenuItem);
        } else {
            this.beginDesignate();
        }
    }

    finishDesignate = (item: MENU_ITEM) => {
        const cursorPos = this.cursor.getPosition();
        const range = this.designator.getRange(cursorPos);
        this.designateRange(range, item);
        this.designator.endDesignating();
        this.designatorTiles = [];
        this.render();
    }

    /**
     * Attempts to place a building
     * @returns {true} if a building was placed
     */
    protected tryPlaceBuilding = (): boolean => {
        if (!this.isBuilding()) {
            return;
        }
        const tiles = this.cursor.getBuildingTiles();
        for (const tile in tiles) {
            if (!this.coordIsBuildable(tiles[tile].pos)) {
                // cannot place building at this location - alert user?
                return false;
            }
        }
        const key = this.cursor.getBuildingKey();
        const center = this.cursor.getPosition();
        for (const tileKey of Object.keys(tiles)) {
            const tile = tiles[tileKey];
            this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
            this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
                buildingKey: tileKey as MENU_ITEM,
                buildingCenter: center,
            };
            this.updateNeighborhood([tile.pos[0], tile.pos[1]]);
        }
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
        return true;
    }

    protected coordIsBuilding = (coord: Point): boolean => {
        return this.gameGrid[this.zLevel][coord[0]][coord[1]].isBuilding();
    }

    protected coordIsBuildable = (coord: Point): boolean => {
        const isBldg = this.coordIsBuilding(coord);
        if (this.strictMode) {
            const tileType = this.gameGrid[this.zLevel][coord[0]][coord[1]].getType();
            //
            if (tileType === TileType.Floor && !isBldg) {
                return true;
            }
        } else {
            return !isBldg;
        }

        return false;
    }
}
