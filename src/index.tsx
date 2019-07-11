import * as _ from "lodash";
import { Component, h, render } from "preact";

import { Constants, Direction } from "./components/constants";
import { Game } from "./components/game";
import { Menu } from "./components/menu";

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
    // rightMouseDown: boolean;
    currentMenu: string;
    highlightedMenuItem: string;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private wrapper: HTMLElement;
    private game: Game;
    private tileSheetImage: HTMLImageElement;

    constructor() {
        super();
        this.setState({
            currentMenu: "top",
            // rightMouseDown: false,
            highlightedMenuItem: null,
        });
    }

    componentDidMount() {
        this.gridElement = document.getElementById("grid");
        this.wrapper = document.getElementById("wrapper");

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
            const newWidth: string = "1fr " + (Constants.MENU_WIDTH_INITIAL + wOff).toString() + "px";
            this.wrapper.style.gridTemplateColumns = newWidth;
        }

        const hOff = this.gridElement.offsetHeight % 16;
        if (hOff !== 0) {
            const newHeight: string = Constants.HEADER_HEIGHT_INITIAL.toString() + "px 1fr " + (Constants.HEADER_HEIGHT_INITIAL + hOff).toString() + "px";
            this.wrapper.style.gridTemplateRows = newHeight;
        }
    }

    initGame() {
        // const _this = this;
        this.game = new Game(this.tileSheetImage, this.gridElement);

        window.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        // stop when not renderable
        // clearInterval(this.timer);
    }

    /**
     * Handles all keyboard inputs that are not handled by {@link this.handleMenuEvent}
     */
    handleKeyPress = (e: KeyboardEvent) => {
        // menu events are handled in handleMenuEvent
        // console.log(e.key, e.keyCode);

        switch (e.keyCode) {
            case 27: //"Escape":
                this.handleMenuEvent("escape");
                break;
            case 38: //"ArrowUp":
            case 104: //numpad 8
                //move north
                this.game.moveCursor(Direction.N);
                break;
            case 105: //numpad 9
                //move ne
                this.game.moveCursor(Direction.NE);
                break;
            case 39: //"ArrowRight":
            case 102: //numpad 6
                //move east
                this.game.moveCursor(Direction.E);
                break;
            case 99: //numpad 3
                //move se
                this.game.moveCursor(Direction.SE);
                break;
            case 40: //"ArrowDown":
            case 98: //numpad 2
                //move south
                this.game.moveCursor(Direction.S);
                break;
            case 97: //numpad 1
                //move sw
                this.game.moveCursor(Direction.SW);
                break;
            case 37: //"ArrowLeft":
            case 100: //numpad 4
                //move west
                this.game.moveCursor(Direction.W);
                break;
            case 103: //numpad 7
                //move nw
                this.game.moveCursor(Direction.NW);
                break;
            default:
                const key = this.state.currentMenu !== "top" ? this.state.currentMenu + ":" + e.key : e.key;
                const hotkeyTarget = Constants.MENU_DICTIONARY[key];
                if (hotkeyTarget) {
                    e.preventDefault();
                    this.handleMenuEvent(Constants.MENU_DICTIONARY[key].id);
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

        switch (e) {
            case "escape":
                //menu handling
                //go up one menu level
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
                break;
            case "designate":
                // this.setState({
                //     highlightedMenuItem: null,
                //     currentMenu: "d",
                // });
                break;
            case "building":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "mine":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "wall":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "stockpile":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "channel":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "upstair":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "downstair":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "udstair":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            case "upramp":
                this.setState({
                    highlightedMenuItem: e,
                });
                break;
            default:
                console.log("uncaught menu event: ", e);
                break;
        }
    }

    renderFooterData() {
        return null;
    }

    render(props, state) {
        return (
            <div id="wrapper">
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
                <div id="grid" class={null/* state.rightMouseDown ? "dragging" : null */}></div>
                <Menu highlightedItem={state.highlightedMenuItem}
                    selectedMenu={state.currentMenu}
                    handleMenuEvent={this.handleMenuEvent} />
                <footer id="footer">
                    <div class="inner">
                        <div class="data">{this.renderFooterData()}</div>
                    </div>
                </footer>
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
