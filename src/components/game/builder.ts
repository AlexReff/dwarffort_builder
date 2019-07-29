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
    public handleEnterKey = (highlightedMenuItem?: MENU_ITEM): boolean => {
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

    public paint = () => {
        // console.log("paint called");
        if (this.cursor.isBuilding()) {
            // console.log("tryPlaceBuilding called");
            this.tryPlaceBuilding();
        } else {
            // this.cursor.
            // switch (this.) {
            //     //
            // }
        }
    }

    public stopBuilding = () => {
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
    }

    public isBuilding = () => {
        return this.cursor.isBuilding();
    }

    public setCursorToBuilding = (e: MENU_ITEM) => {
        const target = BUILDINGS[e];
        if (target == null) {
            this.cursor.stopBuilding();
            return;
        }

        this.cursor.setBuilding(e);
        this.render();
    }

    public handleDesignation = (highlightedMenuItem: MENU_ITEM) => {
        if (this.designator.isDesignating()) {
            this.finishDesignate(highlightedMenuItem);
        } else {
            this.beginDesignate();
        }
    }

    public finishDesignate = (item: MENU_ITEM) => {
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
        return (this.strictMode ? this.gameGrid[this.zLevel][coord[0]][coord[1]].getType() === TileType.Floor : true)
            && !this.coordIsBuilding(coord);
    }
}
