//libraries
//import * as _ from "lodash";
import { Component, h, render } from "preact";
//components
import { Constants, Direction, MenuItemId } from "./components/constants";
import { DebugMenu } from "./components/debug";
import { Game } from "./components/game";
import { Menu } from "./components/menu";
import { TileType } from "./components/tile";

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
    highlightedMenuItem: MenuItemId;
    debug: boolean;
    gridColumnLayout: string;
    gridRowLayout: string;
    mouseLeft: number;
    mouseTop: number;
    mouseOverGrid: boolean;
    refresh: boolean;
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
            highlightedMenuItem: null,
            debug: false,
        });
    }

    componentDidMount() {
        this.gridElement = document.getElementById("grid");
        this.headerElement = document.getElementById("header");

        this.tileSheetImage = new Image();
        this.tileSheetImage.crossOrigin = "Anonymous";
        this.tileSheetImage.onload = () => {
            this.initGame();
        };
        this.tileSheetImage.src = Constants.TILESHEET_URL;

        //update the grid's width in css to divisible by grid
        const wOff = this.gridElement.offsetWidth % Constants.TILE_WIDTH;
        if (wOff !== 0) {
            this.setState({
                gridColumnLayout: `1fr ${(Constants.MENU_WIDTH_INITIAL + wOff).toString()}px`,
            });
        }

        const hOff = this.gridElement.offsetHeight % Constants.TILE_WIDTH;
        if (hOff !== 0) {
            this.setState({
                gridRowLayout: `${Constants.HEADER_HEIGHT_INITIAL.toString()}px 1fr ${(Constants.HEADER_HEIGHT_INITIAL + hOff).toString()}px`,
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
        this.gridElement.addEventListener("contextmenu", this.handleContextMenu);

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

    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pos = this.game.getMousePosition(e);
        this.game.moveCursorTo(pos);
        this.handleEnterRightClick();
        return false;
    }

    /**
     * Handles enter key + right clicks
     */
    handleEnterRightClick() {
        if (this.game.handleEnterKey(this.state.highlightedMenuItem)) {
            this.setState({
                highlightedMenuItem: null,
            });
        }
    }

    handleGridClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pos = this.game.getMousePosition(e);
        this.game.moveCursorTo(pos);
        this.setState({
            refresh: true,
        });
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
        if (e.getModifierState("Control")) {
            return; //don't override ctrl+btn browser hotkeys
        }
        switch (e.keyCode) {
            case Constants.KEYS.VK_RETURN:
                e.preventDefault();
                this.handleEnterRightClick();
                break;
            case Constants.KEYS.VK_BACK_QUOTE:
            case Constants.KEYS.VK_TILDE:
                //toggle debug display
                e.preventDefault();
                this.setState({
                    debug: !this.state.debug,
                });
                break;
            case Constants.KEYS.VK_ESCAPE:
                e.preventDefault();
                this.handleMenuEvent("escape");
                break;
            case Constants.KEYS.VK_UP:
            case Constants.KEYS.VK_NUMPAD8:
                //move north
                e.preventDefault();
                this.game.moveCursor(Direction.N, e.shiftKey);
                break;
            case Constants.KEYS.VK_NUMPAD9:
                //move ne
                e.preventDefault();
                this.game.moveCursor(Direction.NE, e.shiftKey);
                break;
            case Constants.KEYS.VK_RIGHT:
            case Constants.KEYS.VK_NUMPAD6:
                //move east
                e.preventDefault();
                this.game.moveCursor(Direction.E, e.shiftKey);
                break;
            case Constants.KEYS.VK_NUMPAD3:
                //move se
                e.preventDefault();
                this.game.moveCursor(Direction.SE, e.shiftKey);
                break;
            case Constants.KEYS.VK_DOWN:
            case Constants.KEYS.VK_NUMPAD2:
                //move south
                e.preventDefault();
                this.game.moveCursor(Direction.S, e.shiftKey);
                break;
            case Constants.KEYS.VK_NUMPAD1:
                //move sw
                e.preventDefault();
                this.game.moveCursor(Direction.SW, e.shiftKey);
                break;
            case Constants.KEYS.VK_LEFT:
            case Constants.KEYS.VK_NUMPAD4:
                //move west
                e.preventDefault();
                this.game.moveCursor(Direction.W, e.shiftKey);
                break;
            case Constants.KEYS.VK_NUMPAD7:
                //move nw
                e.preventDefault();
                this.game.moveCursor(Direction.NW, e.shiftKey);
                break;
            default:
                const key = this.state.currentMenu !== "top" ? this.state.currentMenu + ":" + e.key : e.key;
                const hotkeyTarget = Constants.MENU_HOTKEYS[key];
                if (hotkeyTarget) {
                    e.preventDefault();
                    this.handleMenuEvent(Constants.MENU_HOTKEYS[key].id);
                } else {
                    // console.log("unhandled keypress: ", e.keyCode, e.key);
                }
                break;
        }
        this.setState({
            refresh: true,
        });
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
            if (this.game.isBuilding()) {
                this.setState({
                    highlightedMenuItem: null,
                });
                this.game.stopBuilding();
            } else if (this.game.isDesignating()) {
                this.game.cancelDesignate();
            } else if (this.state.highlightedMenuItem != null) {
                this.setState({
                    highlightedMenuItem: null,
                });
            } else {
                // go up one menu level
                let newMenu = "";
                const idx = this.state.currentMenu.lastIndexOf(":");
                if (idx > 0) {
                    newMenu = this.state.currentMenu.substr(0, idx);
                } else {
                    newMenu = "top";
                }
                this.setState({
                    currentMenu: newMenu,
                    highlightedMenuItem: null,
                });
            }
        } else {
            if (e in MenuItemId) {
                if (this.state.highlightedMenuItem !== e) {
                    // this.game.cancelDesignate();
                    this.setState({
                        highlightedMenuItem: e as MenuItemId,
                    });
                    //if this item is a building
                    if (e in Constants.BUILDING_TILE_MAP) {
                        this.game.setCursorToBuilding(e as MenuItemId);
                    }
                }
            } else {
                console.log("Unhandled menu event: ", e);
            }
        }
    }

    renderFooterData = () => {
        if (this.game == null) {
            return;
        }
        if (this.game.isDesignating()) {
            return (
                <div class="status">Designating {Constants.MENU_DICTIONARY[this.state.highlightedMenuItem].text}</div>
            );
        } else {
            const tile = this.game.getTileAtCursor();
            const type = tile.getType();
            switch (type) {
                case TileType.Building:
                    return (
                        <div>{tile.getBuildingName()} (Building)</div>
                    );
                case TileType.Empty:
                    break;
                default:
                    return (
                        <div class="status">{TileType[type]}</div>
                    );
            }
        }
        return null;
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

    renderMenuStatus = () => {
        if (this.game == null) {
            return null;
        }
        //if placing a building, 'placing <>'
        //if placing a nonbuilding (designate) 'painting <>'
        //if designating, designating <>
        if (this.game.isDesignating()) {
            return (
                <div>Designating {Constants.MENU_DICTIONARY[this.state.highlightedMenuItem].text}</div>
            );
        }
        if (this.state.highlightedMenuItem != null && this.state.highlightedMenuItem.length > 0) {
            if (this.state.highlightedMenuItem in Constants.BUILDING_TILE_MAP) {
                return (
                    <div>Placing {Constants.MENU_DICTIONARY[this.state.highlightedMenuItem].text}</div>
                );
            }
            return (
                <div>Designating {Constants.MENU_DICTIONARY[this.state.highlightedMenuItem].text}</div>
            );
        }
        return <div></div>;
    }

    render(props, state: IFortressDesignerState) {
        return (
            <div id="page">
                {Constants.DEBUG_MODE_ENABLED ?
                    <DebugMenu isActive={state.debug} />
                    : null}
                <div id="highlighter" style={this.getHighlighterStyle()}></div>
                <div id="wrapper" style={{ gridTemplateColumns: state.gridColumnLayout, gridTemplateRows: state.gridRowLayout }}>
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
                        handleMenuEvent={this.handleMenuEvent}>
                            {this.renderMenuStatus()}
                        </Menu>
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
