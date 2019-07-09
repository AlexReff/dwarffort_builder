import * as _ from "lodash";
import { Color, Group, Item, Point, Raster, Rectangle, setup, Shape, Size, SymbolDefinition, SymbolItem, Tool, ToolEvent, view } from "paper";
import { Display } from "rot-js";

class Game {
    display: Display;
    tileSheetImage: HTMLImageElement;

    constructor(image: HTMLImageElement) {
        // this.tileSheetImage = document.getElementById("sprites") as HTMLImageElement;
        this.tileSheetImage = image;

        this.display = new Display({
            width: 40,
            height: 40,
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: 16,
            tileHeight: 16,
            tileSet: this.tileSheetImage,
            tileMap: {
                " ": [0, 0],
                "@": [16, 0],
            },
        });

        this.display.draw(2, 2, "@", null, null);
    }

    getDisplay() {
        return this.display;
    }
}

export { Game };
