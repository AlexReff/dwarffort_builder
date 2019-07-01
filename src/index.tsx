// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
//// <reference path="../node_modules/@types/gsap/index.d.ts" />

import * as _ from 'lodash';
import { Path, Point, view, setup, Size, Color, Raster, Tool, Rectangle, PaperScope, Group } from 'paper';
import { h, render, Component } from 'preact';
import { items as MENU_ITEMS } from "./data/menu.json";
// import { TweenMax } from 'gsap';

require('./css/index.scss');

const MAX_VELOCITY: number = 50;
const TILE_SIZE: number = 16;

let spriteMap = {
    'ground': [
        1,
        161,
        232,
        237,
        239,
        // 34,
        // 35,
        // 37,
        // 39,
        // 44,
        // 46,
        // 96,
        // 176,
        // 177,
        // 178,
    ],
    'wall': [
        81,
        82,
        83,
    ],
    'mineral': [
        132,
        133,
    ]
};

/*
--Draw a 2d grid on the canvas
Add Mouse support for hover/click on tiles
Add drag support to tilegrid
Add sidebar with build options (+hotkeys?)
Ability to click on sidebar item and modify cursor hover/click behavior
Add drag behavior option - rectangular select or paint (select rectangular area to modify/move/clear or 'paint' - select every item the cursor directly moves over)
Add arrow key support + keyboard tile cursor
Add stockpiles, workshops, walls, multiple z-levels

Add menu state tracking + submenus
Add virtual grid object mapping data structure
Add arrow key support to shift everything on-screen
Add browser resize detection + canvas resizing

'?: Help' Menu?
Add google analytics + simple text ads before public release?
*/

let tileCounter = 1;

class FortressTile {
    public xCoord: number;
    public yCoord: number;

    public gridLocation: { x: number, y: number };
    private rootElement: HTMLElement;

    constructor() {
        this.rootElement = document.createElement("div");
        this.rootElement.classList.add("grid-tile");
        // var rnd = Math.floor(Math.random() * Math.floor(spriteMap['ground'].length));
        // this.rootElement.classList.add(`p-${spriteMap['ground'][rnd]}`);
        // this.rootElement.classList.add("p-" + ((tileCounter++) % 256));

        if (_.random(0, 100, false) >= 5) {
            // this.rootElement.classList.add('p-133');
            // this.rootElement.classList.add('concrete');
            this.rootElement.classList.add('p-1');
        }
        else {
            this.rootElement.classList.add('p-131');
            // this.rootElement.classList.add('p-81');
        }
    }

    update() {
        // this.rootElement.setAttribute("style", `transform: translate3d(${this.yCoord}px, ${this.xCoord}px, 0);`);
        this.rootElement.setAttribute("style", `top: ${this.yCoord}px; left: ${this.xCoord}px;`);
    }

    appendTo(el: HTMLElement) {
        if (this.rootElement.parentElement !== el) {
            el.appendChild(this.rootElement);
            this.rootElement.classList.toggle('hidden', false);
            //this.load();
        }
    }

    removeSelf() {
        if (this.rootElement.parentElement) {
            this.rootElement.classList.toggle('hidden', true);
            this.rootElement.parentElement.removeChild(this.rootElement);
        }
    }
}

class CanvasTile {
    private raster: Raster;
    private id: number;

    constructor() {
        //
    }
}

class FortressDesigner extends Component {
    private gridElement: HTMLElement;
    // private innerGridElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private tool: Tool;
    private group: Group;

    private TileRasters: Array<Raster> = new Array(256);
    private TileGrid: Map<number, Map<number, Raster>> = new Map(); //active tile grid
    private TilePool: Array<Array<Raster>> = new Array(256); //tile rasters to pull from instead of cloning new ones

    // private offsetX: number;
    // private offsetY: number;
    // private zoomLevel: number;

    // private dragging: Boolean = false;
    // private tween: TweenMax;
    // private lastX: number;
    // private lastY: number;
    // private totalRowSize: number;
    // private totalColSize: number;

    // private activeTiles: Map<string, FortressTile> = new Map();

    //cached element pool for reuse
    // private tilePool: Array<FortressTile> = [];

    constructor() {
        super();
        // this.offsetX = 0;
        // this.offsetY = 0;
        // this.zoomLevel = 1;
        // this.totalRowSize = this.totalColSize = 48 * 1;
    }

    componentDidMount() {
        //draw a grid of 'tiles'
        //add :hover effects to each
        //define click behaviors
        //add submenu selectable things

        this.gridElement = document.getElementById("grid");
        // this.innerGridElement = document.getElementById("inner-grid");

        this.canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

        this.canvasElement.width = this.gridElement.offsetWidth;
        this.canvasElement.height = this.gridElement.offsetHeight;

        setup(this.canvasElement);

        this.tool = new Tool();

        // this.tool.onMouseDown = function(event) {
		// 	// path = new Path();
		// 	// path.strokeColor = 'black';
		// 	// path.add(event.point);
		// }

		// this.tool.onMouseDrag = function(event) {
		// 	// path.add(event.point);
        // }
        var raster = new Raster("sprites");

        // this.offsetX = raster.size.width / 2;
        // this.offsetY = raster.size.height / 2;

        this.group = new Group({
            applyMatrix: false,
            position: new Point(raster.size.width / 16 / 2, raster.size.height / 16 / 2)
        });
        //this.group.position = new Point(this.offsetX, this.offsetY);

        this.group.addChild(raster);
        
        raster.position = new Point(0, 0);

        // let tileRasters: Array<Raster> = new Array(256);

        let tileWidth = raster.size.width / 16;
        let tileHeight = raster.size.height / 16;

        let i = 0;
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                let subRect: Rectangle = new Rectangle(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                let subRaster = raster.getSubRaster(subRect);
                this.group.addChild(subRaster);
                this.TileRasters[i++] = subRaster;
                subRaster.remove();
                // subRaster.visible = false;
            }
        }

        raster.remove();

        i = 0;
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                let targetId = 0;
                if (_.random(0, 100, false) > 90) {
                    targetId = 130;
                }
                // let newRaster = this.TileRasters[targetId].clone() as Raster;
                let newRaster = this.getTileInstance(targetId);
                newRaster.position = new Point(x * tileWidth, y * tileHeight);
                // newRaster.visible = true;
                this.group.addChild(newRaster);
            }
        }

        
		view.onFrame = function(event) {
            //
        }
        
        view.onResize = function(event) {
			//console.log("view resized");
        }

        window.addEventListener('resize', this.onWindowResize.bind(this));

        // this.canvas.addEventListener('mousedown', this.onStart.bind(this), false);
        // this.canvas.addEventListener('touchstart', this.onStart.bind(this), false);
        // this.canvas.addEventListener('mousemove', this.onMove.bind(this), false);
        // this.canvas.addEventListener('touchmove', this.onMove.bind(this), false);
        // this.canvas.addEventListener('mouseup', this.onEnd.bind(this), false);
        // this.canvas.addEventListener('touchend', this.onEnd.bind(this), false);

        // for (let row = 0; row <= this.totalRowSize; row++) {
        //     for (let col = 0; col <= this.totalColSize; col++) {
        //         //create every item as empty by default
        //         let xPos = col * TILE_SIZE;
        //         let yPos = row * TILE_SIZE;
        //         let tile = new FortressTile();
        //         tile.xCoord = xPos;
        //         tile.yCoord = yPos;
        //         tile.appendTo(this.innerGridElement);
        //         tile.update();
        //     }
        // }

        // this.onDragCallback(0, 0);

        // let center = this.getCenterPos();
        // this.snapBackCallback(center.x, center.y);

        //this.updateGrid();

        // let xLimit = (canvasTarget.clientWidth / this.tileSize) + 1;
        // let yLimit = (canvasTarget.clientHeight / this.tileSize) + 1;
        // for (let x = 0; x < xLimit; x++) {
        //     for (let y = 0; y < yLimit; y++) {
        //         this.tileMap.drawRect(this.grid_offset_x + this.tileSize * x, this.grid_offset_y + this.tileSize * y, this.tileSize, this.tileSize);
        //     }
        // }
    }

    onWindowResize() {
        view.viewSize = new Size(this.gridElement.offsetWidth, this.gridElement.offsetHeight);
    }

    componentWillUnmount() {
        // stop when not renderable
        // clearInterval(this.timer);
    }

    getTileInstance(id: number) {
        if (typeof this.TilePool[id] !== "undefined") {
            if (this.TilePool[id].length) {
                return this.TilePool[id].pop();
            }
        }
        else {
            this.TilePool[id] = new Array();
        }

        return this.TileRasters[id].clone() as Raster;
    }

    onStart(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        let event = e instanceof MouseEvent ? e : e.touches[0];
        // this.lastX = event.clientX;
        // this.lastY = event.clientY;
        // this.dragging = true;
    }

    // onEnd(e: MouseEvent | TouchEvent) {
    //     e.preventDefault();
    //     this.dragging = false;

    //     let maxWidthOffset = (this.totalColSize + 1) * TILE_SIZE - this.gridElement.offsetWidth;
    //     let maxHeightOffset = (this.totalRowSize + 1) * TILE_SIZE - this.gridElement.offsetHeight;

    //     if (this.offsetX > 0 || this.offsetY > 0 ||
    //         maxWidthOffset < 0 || maxHeightOffset < 0 ||
    //         this.offsetX < -1 * Math.abs(maxWidthOffset) || 
    //         this.offsetY < -1 * Math.abs(maxHeightOffset)) {
    //         let v = { x: this.offsetX, y: this.offsetY };
    //         if (this.tween) this.tween.kill();
    //         let center = this.getCenterPos();
    //         let thisX = maxWidthOffset > 0 ? -1 * maxWidthOffset : center.x;
    //         let thisY = maxHeightOffset > 0 ? -1 * maxHeightOffset : center.y;
    //         this.tween = TweenMax.to(v, 0.4,
    //             {
    //                 // x: Math.max(Math.min(0, this.offsetX), -1 * maxWidthOffset), 
    //                 // y: Math.max(Math.min(0, this.offsetY), -1 * maxHeightOffset), 
    //                 x: thisX, // _.clamp(this.offsetX, -1 * maxWidthOffset, 0),
    //                 y: thisY, // _.clamp(this.offsetY, -1 * maxHeightOffset, 0),
    //                 onUpdate: () => {
    //                     this.snapBackCallback(v.x, v.y);
    //                 }
    //             });
    //     }
    // }

    // getCenterPos() {
    //     return {
    //         x: (this.gridElement.offsetWidth - (this.totalColSize * TILE_SIZE)) / 2,
    //         y: (this.gridElement.offsetHeight - (this.totalRowSize * TILE_SIZE)) / 2
    //     };
    // }

    // snapBackCallback(x: number, y: number) {
    //     this.offsetX = x;
    //     this.offsetY = y;
    //     this.updatePosition();
    // }

    // onDragCallback(deltaX: number, deltaY: number) {
    //     this.offsetX += deltaX;
    //     this.offsetY += deltaY;
    //     this.updatePosition();
    // }

    // updatePosition() {
    //     this.innerGridElement.setAttribute("style", `transform: translate3d(${this.offsetX}px, ${this.offsetY}px, 0) scale(${this.zoomLevel});`);
    //     // this.innerGridElement.setAttribute("style", `left: ${this.offsetX}px; top: ${this.offsetY}px; transform: scale(${this.zoomLevel});`);
    // }

    onResize() {
        //
    }

    // onMove(e: MouseEvent | TouchEvent) {
    //     if (this.dragging) {
    //         let target = e instanceof MouseEvent ? e : e.touches[0];
    //         let xDelta = target.clientX - this.lastX;
    //         let yDelta = target.clientY - this.lastY;
    //         let velocity = Math.abs(xDelta * yDelta);

    //         if (velocity > MAX_VELOCITY) {
    //             let v = { x: xDelta * 0.5, y: yDelta * 0.5 };
    //             if (this.tween) this.tween.kill();
    //             this.tween = TweenMax.to(v, 0.5,
    //                 {
    //                     x: 0, y: 0,
    //                     onUpdate: () => {
    //                         this.onDragCallback(v.x, v.y);
    //                     }
    //                 });
    //         }

    //         this.lastX = target.clientX;
    //         this.lastY = target.clientY;

    //         this.onDragCallback(xDelta, yDelta);
    //     }
    // }

    // updateGrid() {
    //     // let newTiles = new Map();
    //     // let colOffset = ~~(this.offsetX / TILE_SIZE) * -1;
    //     // let rowOffset = ~~(this.offsetY / TILE_SIZE) * -1;

    //     //start with an 'empty' grid at 3x3 size

    //     // for (let row = 0; row < this.viewRows; row++) {
    //     //     for (let col = 0; col < this.viewCols; col++) {
    //     //         //if this pos is visible on screen, render the card
    //     //         let xPos = row * TILE_SIZE + this.offsetX;
    //     //         let yPos = col * TILE_SIZE + this.offsetY;
    //     //         let tCol = colOffset + col;
    //     //         let tRow = rowOffset + row;

    //     //         //get the x,y coord for this tile
    //     //         //the tile should have an 'origin' attribute
    //     //         //we need to _DRAW_ just the ones visible
    //     //         //we should DRAG the inner-grid position, 
    //     //         //upon drag, we need to ADD new tiles that are now visible

    //     //         // if (tCol > 0 && tRow > 0 &&
    //     //         //     tCol < )
    //     //         let index = (col + colOffset) + "" + (row + rowOffset);
    //     //         let thisTile: FortressTile = this.activeTiles[index] || this.getTile(index); //new FortressTile(xPos, yPos);
    //     //         delete this.activeTiles[index];
    //     //         thisTile.xCoord = xPos;
    //     //         thisTile.yCoord = yPos;
    //     //         thisTile.appendTo(this.innerGridElement);
    //     //         thisTile.update();

    //     //         newTiles[index] = thisTile;
    //     //     }
    //     // }

    //     // this.cleanTiles();
    //     // this.activeTiles = newTiles;
    // }

    // cleanTiles() {
    //     let keys = Object.keys(this.activeTiles);
    //     for (let i = 0; i < keys.length; i++) {
    //         let tile: FortressTile = this.activeTiles[keys[i]];
    //         tile.removeSelf();
    //         this.tilePool.push(tile);
    //     }
    //     this.activeTiles = null;
    // }

    // getTile(posCoord: string) {
    //     if (this.tilePool.length > 0) {
    //         let tile = this.tilePool.pop();
    //         return tile;
    //     }
    //     else {
    //         return new FortressTile();
    //     }
    // }

    // setZoom(level: number) {
    //     this.zoomLevel = level;
    //     this.updatePosition();
    // }

    render(props, state) {
        return (
            <div class="wrapper">
                <div id="header">
                    <div class="left"><a class="home-link" href="https://reff.dev/">reff.dev</a></div>
                    <div class="center">
                        <a href="/" class="title">Fortress Designer</a>
                    </div>
                    <div class="right">
                        {/* <div class="cursors">
                            <a><i class="fas fa-mouse-pointer"></i></a>
                            <a><i class="far fa-hand-pointer"></i></a>
                        </div> */}
                    </div>
                </div>
                {/* <div id="grid">
                    <div id="inner-grid"></div>
                </div> */}
                <div id="grid"><canvas id="canvas"></canvas></div>
                <div id="menu">
                    <div class="menu-items">
                        {MENU_ITEMS.map((item) => {
                            return (
                                <div class="menu-item">
                                    {item.key}: {item.text}
                                </div>
                            );
                        })}
                    </div>
                    <div class="menu-bottom">
                        {/* support for this needs to be added to the grid positioning calc 
                        <a onClick={() => this.setZoom(1)}>1</a>
                        <a onClick={() => this.setZoom(2)}>2</a>
                        <a onClick={() => this.setZoom(3)}>3</a>
                        */}
                    </div>
                </div>
            </div>
        );
    }
}


render(<FortressDesigner />, document.getElementById("body"));
