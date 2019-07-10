import * as _ from "lodash";
//import * as PoissonDiskSampling from "poisson-disk-sampling";
import PoissonDiskSampling = require("poisson-disk-sampling");
import { Display } from "rot-js";

import { Constants } from "./constants";

class Game {
    private display: Display;
    private tileSheetImage: HTMLImageElement;
    private cursorPosition: [number, number];
    private noiseTiles: [];
    private gridSize: [number, number]; //[width, height]

    constructor(image: HTMLImageElement, container: HTMLElement) {
        this.tileSheetImage = image;

        //width/height = number of tiles, 16px each
        this.gridSize = [
            Math.floor(container.offsetWidth / 16) + (container.offsetWidth % 16 === 0 ? 0 : 1),
            Math.floor(container.offsetHeight / 16) + (container.offsetHeight % 16 === 0 ? 0 : 1),
        ];

        this.display = new Display({
            width: this.gridSize[0],
            height: this.gridSize[1],
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: Constants.TILE_WIDTH,
            tileHeight: Constants.TILE_HEIGHT,
            tileSet: this.tileSheetImage,
            tileMap: {
                " ": [0, 0],        //empty
                "@": [16, 0],       //player?
                "x": [128, 112],    //cursor
            },
        });

        container.append(this.display.getContainer());

        const sampler = new PoissonDiskSampling([this.gridSize[0], this.gridSize[1]], 3, 8);
        this.noiseTiles = sampler.fill().map((e) => {
            return [Math.round(e[0]), Math.round(e[1])];
        });

        this.cursorPosition = [0, 0];

        this.render();
    }

    public getDisplay() {
        return this.display;
    }

    public render() {
        // this.display.draw(2, 2, "@", null, null);

        // for () {
        //     //
        // }
        this.display.draw(this.cursorPosition[0], this.cursorPosition[1], "x", null, null);
    }

    public moveCursor(direction: number) {
        let isDirty = false;
        switch (direction) {
            case 0: //N
                if (this.cursorPosition[1] > 0) {
                    isDirty = true;
                }
                this.cursorPosition[1] = Math.max(0, this.cursorPosition[1] - 1);
                break;
            case 1: //NE
                if (this.cursorPosition[1] > 0) {
                    isDirty = true;
                }
                this.cursorPosition[0]++;
                this.cursorPosition[1] = Math.max(0, this.cursorPosition[0] - 1);
                break;
            case 2: //E
                if (true /*this.cursorPosition[1] > 0*/) {
                    isDirty = true;
                }
                this.cursorPosition[0]++;
                break;
            case 3: //SE
                if (true /*this.cursorPosition[1] > 0*/) {
                    isDirty = true;
                }
                this.cursorPosition[0]++;
                this.cursorPosition[1]++;
                break;
            case 4: //S
                if (true /*this.cursorPosition[1] > 0*/) {
                    isDirty = true;
                }
                this.cursorPosition[1]++;
                break;
            case 5: //SW
                if (this.cursorPosition[0] > 0) {
                    isDirty = true;
                }
                this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                this.cursorPosition[1]++;
                break;
            case 6: //W
                if (this.cursorPosition[0] > 0) {
                    isDirty = true;
                }
                this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                break;
            case 7: //NW
                if (this.cursorPosition[0] > 0 || this.cursorPosition[1] > 0) {
                    isDirty = true;
                }
                this.cursorPosition[0] = Math.max(0, this.cursorPosition[0] - 1);
                this.cursorPosition[1] = Math.max(0, this.cursorPosition[1] - 1);
                break;
            default:
                return; //do nothing if no valid value found
        }

        if (isDirty) {
            this.render();
        }
    }
}

export { Game };
