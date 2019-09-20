import { TILE_H, TILE_MAP, TILE_W } from "./constants";
import { GameInput } from "./input";
import { GameComponent } from "./redux/FlatReduxState";
import Display from "./rot/display";
import { renderTile } from "./util";

export class Game extends GameComponent {
    rotDisplay: Display;
    displayContainer: HTMLElement;
    canvasRef: HTMLCanvasElement;
    tilesheet: HTMLImageElement;
    inputManager: GameInput;
    /** List of tile fields to render, in order */
    renderProps: string[];

    constructor(canvas: HTMLCanvasElement, tilesheet: HTMLImageElement) {
        super();
        // this.RenderTiles = [];
        this.canvasRef = canvas;
        this.tilesheet = tilesheet;

        this.inputManager = new GameInput();

        this.renderProps = [
            "cursorTiles",
            "buildingTiles",
            "digTiles",
            "decoratorTiles",
        ];

        this.init();
    }

    dataLoaded = () => {
        this.initDisplay();
    }

    storeUpdated = () => {
        if (this.rotDisplay != null) {
            this.renderFull();
        }
    }

    restart = () => {
        this.initDisplay();
        this.renderFull();
    }

    initDisplay = () => {
        this.rotDisplay = new Display({
            canvasElement: this.canvasRef,
            width: this.gridWidth,
            height: this.gridHeight,
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: TILE_W,
            tileHeight: TILE_H,
            tileSet: this.tilesheet,
            tileMap: TILE_MAP,
            tileColorize: true,
            bg: "transparent",
        });

        this.displayContainer = this.rotDisplay.getContainer();
    }

    destroy = () => {
        this.rotDisplay = null;
    }

    renderFull = () => {
        if (this.rotDisplay == null) {
            return;
        }

        this.rotDisplay.clear();

        const startX = this.cameraX;
        const startY = this.cameraY;
        const maxX = startX + this.gridWidth;
        const maxY = startY + this.gridHeight;

        const renderedPositions = {};
        //TODO: Update this to use 'getTiles(state)' helper functions
        //      instead of keeping tile arrays in redux state (unnecessary)
        for (const list of this.renderProps) {
            if (!(list in this)) {
                continue;
            }
            const tiles = this[list];
            for (const tile of tiles) {
                const key = `${tile.x}:${tile.y}`;
                if (key in renderedPositions) {
                    continue;
                }
                if (tile.x >= startX && tile.x < maxX &&
                    tile.y >= startY && tile.y < maxY) {
                    renderTile(this.rotDisplay, tile);
                    renderedPositions[key] = "";
                }
            }
        }
    }
}
