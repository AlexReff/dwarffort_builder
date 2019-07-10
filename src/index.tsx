import * as _ from "lodash";
import { Component, h, render } from "preact";

import { Constants } from "./constants";
import { Game } from "./game";
import { Menu } from "./menu";

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
    rightMouseDown: boolean;
    currentMenu: string;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private game: Game;
    private tileSheetImage: HTMLImageElement;

    constructor() {
        super();
        // this.setState({
        //     currentMenu: "",
        //     rightMouseDown: false,
        // });
    }

    componentDidMount() {
        this.gridElement = document.getElementById("grid");

        this.tileSheetImage = new Image(); // document.createElement("img");
        this.tileSheetImage.crossOrigin = "Anonymous";
        this.tileSheetImage.onload = () => {
            this.initGame();
        };
        this.tileSheetImage.src = Constants.TILESHEET_URL;
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
        switch (e.key) {
            case "ArrowUp":
                this.game.moveCursor(0);
                break;
            case "ArrowDown":
                this.game.moveCursor(4);
                break;
            case "ArrowLeft":
                this.game.moveCursor(6);
                break;
            case "ArrowRight":
                this.game.moveCursor(2);
                break;
            default:
                break;
        }
    }

    //true -> event handled by this code, false -> event unhandled
    handleMenuEvent = (e: string) => {
        if (e == null || e.length === 0) {
            return false;
        }

        switch (e) {
            case "escape":
                break;
            case "building":
                break;
            case "mine":
                break;
            case "wall":
                break;
            case "stockpile":
                break;
        }

        return false;
    }

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
                <div id="grid" class={state.rightMouseDown ? "dragging" : null}></div>
                <Menu initialMenu="top" handleMenuEvent={this.handleMenuEvent} />
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
