import * as _ from "lodash";
import { Color, Group, Item, Point, Raster, Rectangle, setup, Shape, Size, SymbolDefinition, SymbolItem, Tool, ToolEvent, view } from "paper";

class PaperJs {
    private TileSymbols: SymbolDefinition[] = new Array();

    private canvasElement: HTMLCanvasElement;
    private gridElement: HTMLElement;

    private tool: Tool;
    private group: Group;
    private tileGroup: Group;
    private cursor: Shape.Rectangle;

    private tileWidth: number;
    private tileHeight: number;

    private mouseHighlightPosition: Point;

    private offsetX: number;
    private offsetY: number;

    private ActiveTiles: SymbolItem[] = new Array();
    // private TileGrid: Map<number, Map<number, Raster>> = new Map(); //active tile grid
    private TilePool: SymbolItem[][] = new Array(); // tile rasters to pull from instead of cloning new ones

    constructor() {
        this.initBase();
    }

    initBase() {
        // let _this = this;

        this.initPaper();

        // window.addEventListener("resize", this.onWindowResize.bind(this));
    }

    initPaper() {
        const _this = this;

        this.gridElement = document.getElementById("grid");
        this.canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

        // disable right-click canvas context menu
        this.canvasElement.oncontextmenu = (e) => {
            e.preventDefault();
        };

        this.canvasElement.width = this.gridElement.offsetWidth;
        this.canvasElement.height = this.gridElement.offsetHeight;

        setup(this.canvasElement);

        // create the base raster from the spritesheet
        const raster = new Raster("sprites");

        this.tileWidth = raster.size.width / 16;
        this.tileHeight = raster.size.height / 16;

        // slice the spritesheet into tiles
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const subRect = new Rectangle(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                const subRaster = raster.getSubRaster(subRect);
                this.TileSymbols.push(new SymbolDefinition(subRaster));
                subRaster.remove();
            }
        }

        raster.remove();

        this.cursor = new Shape.Rectangle(new Point(-100, -100), new Size(this.tileWidth, this.tileHeight));
        this.cursor.fillColor = new Color(0, 0);
        this.cursor.strokeColor = new Color(1, 1, 0, 1);
        this.cursor.strokeWidth = 1;

        this.offsetX = this.tileWidth / 2;
        this.offsetY = this.tileHeight / 2;

        // tool interaction config
        this.tool = new Tool();

        this.tool.onMouseDown = (event) => {
            switch (event.event.button) {
                case 0: // left mouse button
                    // let targetTile: HitResult = _this.group.hitTest(event.point);
                    // if (typeof targetTile !== "undefined") {
                    //     _this.highlightTile(targetTile.item);
                    // }
                    break;
                case 2: // right mouse button
                    // if (!_this.state.rightMouseDown) {
                    //     _this.setState({
                    //         rightMouseDown: true,
                    //     });
                    //     _this.tileGroup.visible = false;
                    // }
                    // for(var i = 0; i < _this.ActiveTiles.length; i++) {
                    //     _this.ActiveTiles[i].remove();
                    // }
                    break;
            }
        };

        this.tool.onMouseUp = (event) => {
            // event.event.button | 1: left, 2: right
            if (event.event.button === 2) {
                event.event.stopPropagation();
                // _this.setState({
                //     rightMouseDown: false,
                // });

                _this.tileGroup.visible = true;

                // TODO: recycle off-screen tiles and draw new tiles as needed
            }
        };

        // let debouncedMouseMove = _.throttle(function(event) {
        //     let targetTile: HitResult = _this.group.hitTest(event.point);
        //     if (typeof targetTile !== "undefined" && targetTile !== null) {
        //         _this.highlightTile(targetTile.item);
        //     }
        // }, 100, {
        //     leading: true,
        //     trailing: true,
        // });

        // this.tool.onMouseMove = debouncedMouseMove;

        // this.tool.onMouseMove = function (event) {
        //     let targetTile: HitResult = _this.group.hitTest(event.point);
        //     if (typeof targetTile !== "undefined" && targetTile !== null && _this.cursor.position != targetTile.item.position) {
        //         _this.highlightTile(targetTile.item);
        //     }
        // }

        /*
        this.tool.onMouseDrag = (event: ToolEvent) => {
            if (_this.state.rightMouseDown) {
                _this.group.position = _this.group.position.add(new Point(event.delta.x, event.delta.y));
            }
        };
        */

        // view.onFrame = function (event) {
        //     //
        // }

        // view.onResize = function (event) {
        //     //console.log("view resized");
        // }

        // create a group to allow for moving/modifying the entire grid
        this.tileGroup = new Group({
            applyMatrix: false,
        });

        this.group = new Group({
            applyMatrix: false,
            children: [this.tileGroup, this.cursor],
            position: new Point(this.offsetX, this.offsetY),
        });

        this.cursor.bringToFront();
    }

    onWindowResize() {
        view.viewSize = new Size(this.gridElement.offsetWidth, this.gridElement.offsetHeight);
    }

    drawInitialGrid() {
        // draw the initial grid of tiles
        const initialGridWidth = _.floor(this.gridElement.offsetWidth / 16) + 1;
        const initialGridHeight = _.floor(this.gridElement.offsetHeight / 16) + 1;
        for (let y = 0; y < initialGridHeight; y++) {
            for (let x = 0; x < initialGridWidth; x++) {
                let targetId = 0;
                if (_.random(0, 100, false) > 95) {
                    targetId = 130;
                }
                const thisTile = this.getTileInstance(targetId);
                thisTile.position = new Point(x * this.tileWidth, y * this.tileHeight);
                this.tileGroup.addChild(thisTile);
                this.ActiveTiles.push(thisTile);
            }
        }
    }

    getTileInstance(id: number) {
        // return an instance of the specified ID
        // if we have one sitting in the pool, pop it
        if (id < 0 || id >= this.TileSymbols.length) {
            return;
        }
        if (typeof this.TilePool === "undefined") {
            this.TilePool = new Array(256);
        }
        if (typeof this.TilePool[id] === "undefined") {
            this.TilePool[id] = new Array();
        }
        if (this.TilePool[id].length > 0) {
            return this.TilePool[id].pop();
        }

        return this.TileSymbols[id].place();
    }

    highlightTile(tile: Item) {
        this.cursor.position = tile.position;
    }
}

export { PaperJs };
