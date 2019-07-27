import { Point, TILE_HEIGHT, TILE_MAP, TILE_WIDTH } from "../constants";
import Display from "../rot/display";
import { GameAnimator } from "./animator";

export class GameRender extends GameAnimator {

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);
        this.init();
    }

    public init = () => {
        this.updateGameSize(this.container);

        this.display = new Display({
            width: this.gridSize[0],
            height: this.gridSize[1],
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,
            tileSet: this.tileSheetImage,
            tileMap: TILE_MAP,
            tileColorize: true,
            bg: "transparent",
        });

        this.container.append(this.display.getContainer());

        if (this.gameGrid != null && Object.keys(this.gameGrid).length > 0) {
            // do not overwrite existing map
        } else {
            this.populateFloor();
        }

        this.render();
    }

    /**
     * Renders the correct tile at the given coord
     * @param coord MAP coordinate to render
     */
    protected renderPosition = (coord: Point) => {
        if (this.isTileAnimating(coord)) {
            const parms = this.designator.getDrawData(coord);
            const newCoord = this.getGridCoord([Number(parms[0]), Number(parms[1])]);
            parms[0] = newCoord[0];
            parms[1] = newCoord[1];
            this.display.draw.apply(this.display, parms);
        } else {
            if (this.cursor.coordIsCursor(coord)) {
                // render just cursor
                const parms = this.cursor.getDrawData(coord, this.coordIsBuilding(coord));
                // const newCoord = this.getGridCoord([Number(parms[0]), Number(parms[1])]);
                // parms[0] = newCoord[0];
                // parms[1] = newCoord[1];
                this.parseParms(parms);
                this.display.draw.apply(this.display, parms);
            } else {
                const parms = this.gameGrid[this.zLevel][coord[0]][coord[1]].getDrawData(coord);
                this.parseParms(parms);
                this.display.draw.apply(this.display, parms);
            }
        }
    }

    protected parseParms = (parms: Array<number | string | string[]>) => {
        const newCoord = this.getGridCoord([Number(parms[0]), Number(parms[1])]);
        parms[0] = newCoord[0];
        parms[1] = newCoord[1];
        return parms;
    }

    /**
     * Render the entire grid
     */
    protected render = () => {
        for (let x = this.camera[0]; x < this.camera[0] + this.gridSize[0]; x++) {
            for (let y = this.camera[1]; y < this.camera[1] + this.gridSize[1]; y++) {
                this.renderPosition([x, y]);
            }
        }
        this.dirtyTiles = [];
    }

    /**
     * Re-draws only 'dirty' tiles
     */
    protected renderDirty = () => {
        if (this.dirtyTiles == null || this.dirtyTiles.length === 0) {
            return;
        }
        const dirty = new Array<Point>();
        while (this.dirtyTiles.length > 0) {
            dirty.push(this.dirtyTiles.pop());
        }
        for (const coord of dirty) {
            this.renderPosition(coord);
        }
    }

    protected renderCursor() {
        for (const i of this.cursor.getRange()) {
            this.renderPosition(i);
        }
    }

    protected renderDesignated = () => {
        if (this.designatorTiles == null || this.designatorTiles.length === 0) {
            return;
        }
        for (const coord of this.designatorTiles) {
            this.renderPosition(coord);
        }
    }
}