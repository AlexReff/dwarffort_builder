//libraries
import * as _ from "lodash";
import { Component, h, render } from "preact";
//components
import { Constants, Direction } from "./components/constants";
import { DebugMenu } from "./components/debug";
import { Game } from "./components/game";
import { Menu } from "./components/menu";
import { TileType } from "./components/Tile";

require("./css/index.scss");

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

interface IFortressDesignerState {
    // only things relevant to HTML state
    currentMenu: string;
    highlightedMenuItem: string;
    debug: boolean;
    gridColumnLayout: string;
    gridRowLayout: string;
    mouseLeft: number;
    mouseTop: number;
    mouseOverGrid: boolean;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private canvasElement: HTMLElement;
    private headerElement: HTMLElement;
    private tileSheetImage: HTMLImageElement;
    private game: Game;

    constructor() {
        super();

        this.setState({
            currentMenu: "top",
            // rightMouseDown: false,
            highlightedMenuItem: null,
            debug: false,
        });
    }

    componentDidMount() {
        this.gridElement = document.getElementById("grid");
        this.headerElement = document.getElementById("header");

        this.tileSheetImage = new Image(); // document.createElement("img");
        this.tileSheetImage.crossOrigin = "Anonymous";
        this.tileSheetImage.onload = () => {
            this.initGame();
        };
        this.tileSheetImage.src = Constants.TILESHEET_URL;

        //update the grid's width in css to divisible by grid
        const wOff = this.gridElement.offsetWidth % 16;
        // debugger;
        if (wOff !== 0) {
            //adjust size
            const newWidth = `1fr ${(Constants.MENU_WIDTH_INITIAL + wOff).toString()}px`;
            this.setState({
                gridColumnLayout: newWidth,
            });
        }

        const hOff = this.gridElement.offsetHeight % 16;
        if (hOff !== 0) {
            const newHeight = `${Constants.HEADER_HEIGHT_INITIAL.toString()}px 1fr ${(Constants.HEADER_HEIGHT_INITIAL + hOff).toString()}px`;
            this.setState({
                gridRowLayout: newHeight,
            });
        }
    }

    initGame = () => {
        this.game = new Game(this.tileSheetImage, this.gridElement);
        this.canvasElement = this.game.getCanvas();

        this.gridElement.addEventListener("click", this.handleGridClick);
        this.gridElement.addEventListener("mousemove", this.handleMouseMove);
        this.gridElement.addEventListener("mouseover", this.handleMouseOver);
        this.gridElement.addEventListener("mouseleave", this.handleMouseLeave);
        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("resize", this.handleWindowResize);
    }

    componentWillUnmount() {
        this.gridElement.removeEventListener("click", this.handleGridClick);
        this.gridElement.removeEventListener("mousemove", this.handleMouseMove);
        this.gridElement.removeEventListener("mouseover", this.handleMouseOver);
        this.gridElement.removeEventListener("mouseleave", this.handleMouseLeave);
        window.removeEventListener("keydown", this.handleKeyPress);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("resize", this.handleWindowResize);
    }

    handleGridClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pos = this.game.getMousePosition(e);
        this.game.moveCursorTo(pos);
        // DEBUG ONLY
        // this.game.setTile(pos, TileType.Wall);
    }

    handleMouseMove = (e) => {
        this.setState({
            mouseLeft: e.clientX,
            mouseTop: e.clientY,
        });
    }

    handleMouseOver = (e) => {
        this.setState({
            mouseOverGrid: true,
        });
    }

    handleMouseLeave = (e) => {
        this.setState({
            mouseOverGrid: false,
        });
    }

    handleWindowResize = (e: Event) => {
        // TODO: Handle this
    }

    handleKeyUp = (e: KeyboardEvent) => {
        //
    }

    handleKeyPress = (e: KeyboardEvent) => {
        switch (e.keyCode) {
            case 13: //Enter key
                this.game.handleDesignation();
                // this.isDesignating = !this.isDesignating;
                //do stuff
                // if (this.state.highlightedMenuItem && this.state.highlightedMenuItem.length) {
                //     switch (this.state.highlightedMenuItem) { //menu ids
                //         case "mine":
                //             // console.log("begin mine designation");
                //             break;
                //         default:
                //             break;
                //     }
                // }
                break;
            case 192: //` tilde
                //toggle debug display
                this.setState({
                    debug: !this.state.debug,
                });
                break;
            case 27: //"Escape":
                this.handleMenuEvent("escape");
                break;
            case 38: //"ArrowUp":
            case 104: //numpad 8
                //move north
                this.game.moveCursor(Direction.N, e.shiftKey);
                break;
            case 105: //numpad 9
                //move ne
                this.game.moveCursor(Direction.NE, e.shiftKey);
                break;
            case 39: //"ArrowRight":
            case 102: //numpad 6
                //move east
                this.game.moveCursor(Direction.E, e.shiftKey);
                break;
            case 99: //numpad 3
                //move se
                this.game.moveCursor(Direction.SE, e.shiftKey);
                break;
            case 40: //"ArrowDown":
            case 98: //numpad 2
                //move south
                this.game.moveCursor(Direction.S, e.shiftKey);
                break;
            case 97: //numpad 1
                //move sw
                this.game.moveCursor(Direction.SW, e.shiftKey);
                break;
            case 37: //"ArrowLeft":
            case 100: //numpad 4
                //move west
                this.game.moveCursor(Direction.W, e.shiftKey);
                break;
            case 103: //numpad 7
                //move nw
                this.game.moveCursor(Direction.NW, e.shiftKey);
                break;
            default:
                const key = this.state.currentMenu !== "top" ? this.state.currentMenu + ":" + e.key : e.key;
                const hotkeyTarget = Constants.MENU_DICTIONARY[key];
                if (hotkeyTarget) {
                    e.preventDefault();
                    this.handleMenuEvent(Constants.MENU_DICTIONARY[key].id);
                } else {
                    console.log("unhandled keypress: ", e.keyCode, e.key);
                }
                break;
        }
    }

    handleMenuEvent = (e: string) => {
        if (e == null || e.length === 0) {
            return;
        }

        if (e === "top") {
            this.setState({
                highlightedMenuItem: null,
                currentMenu: "top",
            });
            return;
        }

        if (Constants.MENU_SUBMENUS[e] != null) {
            this.setState({
                highlightedMenuItem: null,
                currentMenu: Constants.MENU_SUBMENUS[e],
            });
            return;
        }

        if (e === "escape") {
            //go up one menu level OR stop designating
            if (this.game.getIsDesignating()) {
                // stop designation
                this.game.cancelDesignate();
            } else {
                let newMenu = "";
                const idx = this.state.currentMenu.lastIndexOf(":");
                if (idx > 0) {
                    newMenu = this.state.currentMenu.substr(0, idx);
                } else {
                    newMenu = "top";
                }
                this.setState({
                    highlightedMenuItem: null,
                    currentMenu: newMenu,
                });
            }
        } else {
            this.setState({
                highlightedMenuItem: e,
            });
        }
    }

    renderFooterData = () => {
        return null;
    }

    getWrapperStyle = () => {
        return {
            gridTemplateColumns: this.state.gridColumnLayout,
            gridTemplateRows: this.state.gridRowLayout,
        };
    }

    getGridPosition = (clientX: number, clientY: number): [number, number] => {
        //returns top-left coordinate for grid item based on mouse position
        const bounds = this.canvasElement.getBoundingClientRect();
        const maxHeight = this.canvasElement.offsetHeight - Constants.TILE_HEIGHT + bounds.top;
        const maxWidth = this.canvasElement.offsetWidth - Constants.TILE_WIDTH + bounds.left;
        const leftPos = Math.max(0, Math.min(maxWidth, clientX - (clientX % Constants.TILE_WIDTH)));
        const topPos = Math.max(0, Math.min(maxHeight, clientY - (clientY % Constants.TILE_HEIGHT)));
        return [leftPos, topPos];
    }

    getHighlighterStyle = () => {
        if (this.headerElement) {
            if (!this.state.mouseOverGrid || (this.state.mouseLeft == null || this.state.mouseTop == null)) {
                return {
                    display: "none",
                };
            }
            const targetPos = this.getGridPosition(this.state.mouseLeft, this.state.mouseTop);
            return {
                width: `${Constants.TILE_WIDTH}px`,
                height: `${Constants.TILE_HEIGHT}px`,
                left: targetPos[0],
                top: targetPos[1],
            };
        }
    }

    render(props, state: IFortressDesignerState) {
        return (
            <div id="page">
                {Constants.DEBUG_MODE_ENABLED ?
                    <DebugMenu isActive={state.debug} />
                    : null}
                <div id="highlighter" style={this.getHighlighterStyle()}></div>
                <div id="wrapper" style={this.getWrapperStyle()}>
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
                    <div id="grid"></div>
                    <Menu highlightedItem={state.highlightedMenuItem}
                        selectedMenu={state.currentMenu}
                        handleMenuEvent={this.handleMenuEvent} />
                    <footer id="footer">
                        <div class="inner">
                            <div class="data">{this.renderFooterData()}</div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

render(<FortressDesigner />, document.getElementById("body"));

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
