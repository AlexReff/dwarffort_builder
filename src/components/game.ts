import { TILE_H, TILE_MAP, TILE_W } from "./constants";
import { GameInput } from "./input";
import { GameComponent } from "./redux/FlatReduxState";
import { toggleAnimation } from "./redux/settings/actions";
import store from "./redux/store";
import Display from "./rot/display";
import { ITileGeneratorComponent } from "./tiles/_base";
import { Builder } from "./tiles/builder";
import { Cursor } from "./tiles/cursor";
import Decorator from "./tiles/decorator";
import { Digger } from "./tiles/digger";
import { renderTile } from "./util";

export class Game extends GameComponent {
    rotDisplay: Display;
    displayContainer: HTMLElement;
    canvasRef: HTMLCanvasElement;
    tilesheet: HTMLImageElement;
    animationTimer: any;

    inputManager: GameInput;
    cursor: Cursor;
    decorator: Decorator;
    digger: Digger;
    builder: Builder;
    /** List of tile fields to render, in order */
    renderObjs: ITileGeneratorComponent[];

    constructor(canvas: HTMLCanvasElement, tilesheet: HTMLImageElement) {
        super();
        this.canvasRef = canvas;
        this.tilesheet = tilesheet;

        this.inputManager = new GameInput();
        this.cursor = new Cursor();
        this.decorator = new Decorator();
        this.digger = new Digger();
        this.builder = new Builder();

        this.animationTimer = setInterval(this.handleAnimationTick, 333);

        this.renderObjs = [
            this.cursor,    //cursor
            this.builder,   //buildings
            this.digger,    //walls/floors
            this.decorator, //empty tiles
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
        for (const cmpnt of this.renderObjs) {
            const tiles = cmpnt.getTiles(this);
            for (const tile of tiles) {
                const key = `${tile.x}:${tile.y}`;
                if (key in renderedPositions) {
                    continue;
                }
                if (tile.x >= startX && tile.x < maxX &&
                    tile.y >= startY && tile.y < maxY) {
                    renderTile(this, tile);
                    renderedPositions[key] = "";
                }
            }
        }
    }

    handleAnimationTick = () => {
        store.dispatch(toggleAnimation());
    }
}
