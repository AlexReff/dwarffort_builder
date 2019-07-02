// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
//// <reference path="../node_modules/@types/gsap/index.d.ts" />

import * as _ from 'lodash';
import { Path, Point, view, setup, Size, Color, Raster, Tool, Rectangle, PaperScope, Group, SymbolDefinition, SymbolItem, ToolEvent, Shape } from 'paper';
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

class CanvasTile {
    private raster: Raster;
    private id: number;

    constructor(tileId?: number) {
        // this.raster = _raster;
        this.id = tileId;
    }
}

class FortressDesigner extends Component<{}, {
    rightMouseDown: boolean
}> {
    private gridElement: HTMLElement;
    // private innerGridElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private tool: Tool;
    private group: Group;
    private cursor: Shape.Rectangle;

    private TileSymbols: Array<SymbolDefinition> = new Array();
    private ActiveTiles: Array<SymbolItem> = new Array();
    // private TileGrid: Map<number, Map<number, Raster>> = new Map(); //active tile grid
    private TilePool: Array<Array<SymbolItem>> = new Array(); //tile rasters to pull from instead of cloning new ones

    private tileWidth: number;
    private tileHeight: number;

    private mouseHighlightPosition: Point;

    private offsetX: number;
    private offsetY: number;
    // private zoomLevel: number;

    constructor() {
        super();
        // this.offsetX = 0;
        // this.offsetY = 0;
        // this.zoomLevel = 1;
        // this.totalRowSize = this.totalColSize = 48 * 1;
        this.setState({
            rightMouseDown: false,
        });
    }

    componentDidMount() {
        //draw a grid of 'tiles'
        //add :hover effects to each
        //define click behaviors
        //add submenu selectable things

        this.initBase();

        let _this = this;

        //draw the initial grid of tiles
        let initialGridWidth = _.floor(this.gridElement.offsetWidth / 16) + 1;
        let initialGridHeight = _.floor(this.gridElement.offsetHeight / 16) + 1;

        for (let y = 0; y < initialGridHeight; y++) {
            for (let x = 0; x < initialGridWidth; x++) {
                let targetId = 0;
                if (_.random(0, 100, false) > 95) {
                    targetId = 130;
                }
                let thisTile = this.getTileInstance(targetId);
                thisTile.position = new Point(x * this.tileWidth, y * this.tileHeight);
                this.group.addChild(thisTile);
                this.ActiveTiles.push(thisTile);

                //TODO: create the 'highlight' cursor raster/item + move it's position with this event
                //      attach to the entire canvas mouseout (or group?) instead of individual items
                thisTile.onMouseEnter = function (event: any) {
                    // this.fillColor = 'red';
                    _this.mouseHighlightPosition = new Point(event.currentTarget.position.x, event.currentTarget.position.y);
                    //console.log(event);
                }
                thisTile.onMouseLeave = function (event) {
                    // this.fillColor = 'red';
                    //_this.mouseHighlightPosition = new Point(event.currentTarget.position.x, event.currentTarget.position.y);
                    console.log(event);
                }
            }
        }

        view.onFrame = function (event) {
            //
        }

        view.onResize = function (event) {
            //console.log("view resized");
        }

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        view.viewSize = new Size(this.gridElement.offsetWidth, this.gridElement.offsetHeight);
    }

    componentWillUnmount() {
        // stop when not renderable
        // clearInterval(this.timer);
    }

    initBase() {
        let _this = this;

        this.gridElement = document.getElementById("grid");
        this.canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

        //disable right-click canvas context menu
        this.canvasElement.oncontextmenu = function (e) {
            e.preventDefault();
        };

        this.canvasElement.width = this.gridElement.offsetWidth;
        this.canvasElement.height = this.gridElement.offsetHeight;

        setup(this.canvasElement);

        //create the base raster from the spritesheet
        var raster = new Raster("sprites");

        this.tileWidth = raster.size.width / 16;
        this.tileHeight = raster.size.height / 16;

        //slice the spritesheet into tiles
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                let subRect = new Rectangle(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                let subRaster = raster.getSubRaster(subRect);
                this.TileSymbols.push(new SymbolDefinition(subRaster));
                // this.TileSymbols[this.TileSymbols.length - 1].item.onMouseEnter = function(event: any) {
                //     // this.fillColor = 'red';
                //     //_this.mouseHighlightPosition = event.currentTarget.position
                //     console.log(event);
                // }
                // this.TileSymbols[this.TileSymbols.length - 1].item.onMouseLeave = function(event) {
                //     // this.fillColor = 'red';
                //     console.log(event);
                // }
                subRaster.remove();
            }
        }

        raster.remove();

        this.cursor = new Shape.Rectangle(new Point(-100,-100), new Size(this.tileWidth, this.tileHeight));
        this.cursor.fillColor = new Color(0, 0);
        this.cursor.strokeColor = new Color(.2, .5, .1);

        this.offsetX = this.tileWidth / 2;
        this.offsetY = this.tileHeight / 2;

        //tool interaction config
        this.tool = new Tool();

        this.tool.onMouseDown = function (event) {
            //event.event.button | 1: left, 2: right
            if (event.event.button === 2) {
                // _this.rightMouseDown = true;
                _this.setState({
                    rightMouseDown: true,
                });
            }

            // path = new Path();
            // path.strokeColor = 'black';
            // path.add(event.point);
        }

        this.tool.onMouseUp = function (event) {
            //event.event.button | 1: left, 2: right
            if (event.event.button === 2) {
                event.event.stopPropagation();
                // _this.rightMouseDown = false;
                _this.setState({
                    rightMouseDown: false,
                });

                //TODO: recycle off-screen tiles and draw new tiles as needed
            }
        }

        this.tool.onMouseDrag = function (event: ToolEvent) {
            if (_this.state.rightMouseDown) {
                _this.group.position = _this.group.position.add(new Point(event.delta.x, event.delta.y));
            }
        }

        //create a group to allow for moving/modifying the entire grid
        this.group = new Group({
            applyMatrix: false,
            position: new Point(this.offsetX, this.offsetY),
            children: [this.cursor, this.tool]
        });
    }

    getTileInstance(id: number) {
        //return an instance of the specified ID
        //if we have one sitting in the pool, pop it
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


    // updatePosition() {
    //     this.innerGridElement.setAttribute("style", `transform: translate3d(${this.offsetX}px, ${this.offsetY}px, 0) scale(${this.zoomLevel});`);
    //     // this.innerGridElement.setAttribute("style", `left: ${this.offsetX}px; top: ${this.offsetY}px; transform: scale(${this.zoomLevel});`);
    // }

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
                <div id="grid" class={state.rightMouseDown ? "dragging" : null}><canvas id="canvas" data-paper-hidpi="off"></canvas></div>
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
