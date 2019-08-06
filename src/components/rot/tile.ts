import Canvas from "../rot/canvas";
import { DisplayData } from "../rot/types";

/**
 * @class Tile backend
 * @private
 */
export default class Tile extends Canvas {
    _colorCanvas: HTMLCanvasElement;

    constructor(canvas?: HTMLCanvasElement) {
        super(canvas);
        this._colorCanvas = document.createElement("canvas");
        // if (canvas) {
        //     this._colorCanvas = canvas;
        // } else {
        //     this._colorCanvas = document.createElement("canvas");
        // }
    }

    draw(data: DisplayData, clearBefore: boolean) {
        const [x, y, ch, fg, bg] = data;

        const tileWidth = this._options.tileWidth;
        const tileHeight = this._options.tileHeight;

        if (clearBefore) {
            if (this._options.tileColorize) {
                this._ctx.clearRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            } else {
                this._ctx.fillStyle = bg;
                this._ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            }
        }

        if (!ch) { return; }

        const chars = ([] as string[]).concat(ch);
        const fgs = ([] as string[]).concat(fg);
        const bgs = ([] as string[]).concat(bg);

        for (let i = 0; i < chars.length; i++) {
            const tile = this._options.tileMap[chars[i]];
            if (!tile) { throw new Error(`Char "${chars[i]}" not found in tileMap`); }

            if (this._options.tileColorize) { // apply colorization
                const canvas = this._colorCanvas;
                const context = canvas.getContext("2d") as CanvasRenderingContext2D;
                context.globalCompositeOperation = "source-over";
                context.clearRect(0, 0, tileWidth, tileHeight);

                const thisFg = fgs[i];
                const thisBg = bgs[i];

                context.drawImage(
                    this._options.tileSet!,
                    tile[0], tile[1], tileWidth, tileHeight,
                    0, 0, tileWidth, tileHeight,
                );

                if (thisFg !== "transparent") {
                    context.fillStyle = thisFg;
                    context.globalCompositeOperation = "source-atop";
                    context.fillRect(0, 0, tileWidth, tileHeight);
                }

                if (thisBg !== "transparent") {
                    context.fillStyle = thisBg;
                    context.globalCompositeOperation = "destination-over";
                    context.fillRect(0, 0, tileWidth, tileHeight);
                }

                this._ctx.drawImage(canvas, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            } else { // no colorizing, easy
                this._ctx.drawImage(
                    this._options.tileSet!,
                    tile[0], tile[1], tileWidth, tileHeight,
                    x * tileWidth, y * tileHeight, tileWidth, tileHeight,
                );
            }
        }
    }

    computeSize(availWidth: number, availHeight: number): [number, number] {
        const width = Math.floor(availWidth / this._options.tileWidth);
        const height = Math.floor(availHeight / this._options.tileHeight);
        return [width, height];
    }

    computeFontSize(): number {
        throw new Error("Tile backend does not understand font size");
    }

    _normalizedEventToPosition(x: number, y: number): [number, number] {
        return [Math.floor(x / this._options.tileWidth), Math.floor(y / this._options.tileHeight)];
    }

    _updateSize() {
        const opts = this._options;
        this._ctx.canvas.width = opts.width * opts.tileWidth;
        this._ctx.canvas.height = opts.height * opts.tileHeight;
        this._colorCanvas.width = opts.tileWidth;
        this._colorCanvas.height = opts.tileHeight;
    }
}
