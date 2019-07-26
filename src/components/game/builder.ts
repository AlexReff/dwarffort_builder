import { BUILDING_TILE_MAP, MenuItemId, Point } from "../constants";
import { GameCursor } from "./cursor";

/**
 * Requires CAMERA, CURSOR
 */
export class GameBuilder extends GameCursor {
    protected buildings: {
        [key: string]:
        {
            buildingKey: MenuItemId,
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
    public handleEnterKey(highlightedMenuItem?: MenuItemId): boolean {
        if (highlightedMenuItem == null) {
            return;
        }
        if (this.cursor.isBuilding()) {
            return this.placeBuilding();
        } else {
            this.handleDesignation(highlightedMenuItem);
            return false;
        }
    }

    public stopBuilding() {
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
    }

    public isBuilding() {
        return this.cursor.isBuilding();
    }

    public setCursorToBuilding(e: MenuItemId) {
        const target = BUILDING_TILE_MAP[e];
        if (target == null) {
            this.cursor.stopBuilding();
            return;
        }

        this.cursor.setBuilding(e);
        this.render();
    }

    public handleDesignation(highlightedMenuItem: MenuItemId) {
        if (this.designator.isDesignating()) {
            this.finishDesignate(highlightedMenuItem);
        } else {
            this.beginDesignate();
        }
    }

    public finishDesignate(item: MenuItemId) {
        const cursorPos = this.cursor.getPosition();
        const range = this.designator.getRange(cursorPos);
        this.designateRange(range, item);
        this.designator.endDesignating();
        this.designatorTiles = [];
        this.render();
    }

    protected placeBuilding = (): boolean => {
        const tiles = this.cursor.getBuildingTiles();
        for (const tile in tiles) {
            if (this.coordIsBuilding(tiles[tile].pos)) {
                return false;
            }
        }
        const key = this.cursor.getBuildingKey();
        const center = this.cursor.getPosition();
        for (const tileKey of Object.keys(tiles)) {
            const tile = tiles[tileKey];
            this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
            this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
                buildingKey: tileKey as MenuItemId,
                buildingCenter: center,
            };
        }
        this.cursor.stopBuilding();
        this.designator.endDesignating();
        this.render();
        return true;
    }

    protected coordIsBuilding = (coord: Point): boolean => {
        if (this.buildings == null) {
            return false;
        }

        return `${coord[0]}:${coord[1]}` in this.buildings;
    }
}
