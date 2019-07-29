//libraries
import * as _ from "lodash";
import { Component, h, render } from "preact";
//components
import { BUILDINGS, DEBUG, DIRECTION, HEADER_H, KEYS, MENU_IDS, MENU_ITEM, MENU_KEYS, MENU_W, SUBMENUS, TILE_H, TILE_URL, TILE_W, DEFAULTS } from "./components/constants";
import { DebugMenu } from "./components/debug";
import { CURSOR_BEHAVIOR } from "./components/enums";
import { GameRender } from "./components/game/render";
import { Menu } from "./components/menu";
import { Tile, TileType } from "./components/tile";

require("./css/index.scss");

/*
? Add drag support to tilegrid
. Ability to click on sidebar item and modify cursor hover/click behavior
. Add drag behavior option - rectangular select or paint
    (select rectangular area to modify/move/clear or 'paint' - select every item the cursor directly moves over)
'?: Help' Menu?
Add google analytics + simple text ads before public release?
*/

// only things relevant to HTML state
interface IFortressDesignerState {
    currentMenu: string;
    currentMenuItem: MENU_ITEM;

    debug: boolean;
    strictMode: boolean;
    gridColumnLayout: number;
    gridRowLayout: number;
    mouseLeft: number;
    mouseTop: number;
    mouseOverGrid: boolean;
    painting: boolean;

    zLevel: number;
    hasChangedZLevel: boolean;
    windowResizing: boolean;
    gameLoading: boolean;
    cursorMode: CURSOR_BEHAVIOR;

    /**
     * Only used to trigger react re-renders
     */
    refresh: boolean;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private canvasElement: HTMLElement;
    private headerElement: HTMLElement;
    private tileSheetImage: HTMLImageElement;
    private game: GameRender;
    private listenersOn: boolean;

    constructor() {
        super();

        this.listenersOn = false;

        this.setState({
            currentMenu: "top",
            currentMenuItem: null,
            debug: false,
            zLevel: 0,
            hasChangedZLevel: false,
            mouseOverGrid: false,
            windowResizing: false,
            gameLoading: true,
            painting: false,
            gridColumnLayout: 0,
            gridRowLayout: 0,
            strictMode: DEFAULTS.STRICT_MODE,
            cursorMode: DEFAULTS.CURSOR_MODE,
        });
    }

    componentDidMount() {
        this.gridElement = document.getElementById("grid");
        this.headerElement = document.getElementById("header");

        this.updateWrapperCss();

        this.tileSheetImage = new Image();
        this.tileSheetImage.crossOrigin = "Anonymous";
        this.tileSheetImage.onload = () => {
            this.initGame();
        };
        this.tileSheetImage.src = TILE_URL;

        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("resize", this.handleWindowResize);
    }

    initGame = () => {
        if (this.game == null) {
            this.game = new GameRender(this.tileSheetImage, this.gridElement);
        } else {
            this.game.init();
        }

        this.canvasElement = this.game.getCanvas();

        if (!this.listenersOn) {
            this.gridElement.addEventListener("click", this.handleGridClick);
            this.gridElement.addEventListener("mousemove", this.handleMouseMove);
            this.gridElement.addEventListener("mouseover", this.handleMouseOver);
            this.gridElement.addEventListener("mouseleave", this.handleMouseLeave);
            this.gridElement.addEventListener("contextmenu", this.handleContextMenu);
            this.gridElement.addEventListener("mousedown", this.handleMouseDown);
            this.gridElement.addEventListener("mouseup", this.handleMouseUp);

            this.listenersOn = true;
        }

        this.setState({
            gameLoading: false,
        });
    }

    destroyGame = () => {
        this.game.destroy();

        if (this.canvasElement != null) {
            this.canvasElement.remove();
            this.canvasElement = null;
        }

        if (this.listenersOn) {
            this.gridElement.removeEventListener("click", this.handleGridClick);
            this.gridElement.removeEventListener("mousemove", this.handleMouseMove);
            this.gridElement.removeEventListener("mouseover", this.handleMouseOver);
            this.gridElement.removeEventListener("mouseleave", this.handleMouseLeave);
            this.gridElement.removeEventListener("contextmenu", this.handleContextMenu);
            this.gridElement.removeEventListener("mousedown", this.handleMouseDown);
            this.gridElement.removeEventListener("mouseup", this.handleMouseUp);

            this.listenersOn = false;
        }
    }

    setWindowResizing = () => {
        this.destroyGame();
        this.setState({
            windowResizing: true,
        });
    }

    // tslint:disable-next-line: member-ordering
    windowResizeBouncer = _.debounce(this.setWindowResizing, 300, { leading: true, trailing: false });

    endWindowResizing = () => {
        this.updateWrapperCss(() => {
            this.initGame();
            this.setState({ windowResizing: false });
        });
    }

    // tslint:disable-next-line: member-ordering
    windowResizeEndBouncer = _.debounce(this.endWindowResizing, 400, { leading: false, trailing: true });

    handleWindowResize = (e: Event) => {
        this.windowResizeBouncer();
        this.windowResizeEndBouncer();
    }

    updateWrapperCss = (callback?: () => void) => {
        //update the grid's width in css to divisible by grid
        const wOff = (this.gridElement.offsetWidth + this.state.gridColumnLayout) % TILE_W;
        const hOff = (this.gridElement.offsetHeight + this.state.gridRowLayout) % TILE_W;
        this.setState({
            gridColumnLayout: wOff,
            gridRowLayout: hOff,
        }, callback);
    }

    getWrapperCss = () => {
        if (this.state.gridColumnLayout != null && this.state.gridRowLayout != null) {
            return {
                gridTemplateColumns: `1fr ${(MENU_W + this.state.gridColumnLayout).toString()}px`,
                gridTemplateRows: `${HEADER_H.toString()}px 1fr ${(HEADER_H + this.state.gridRowLayout).toString()}px`,
            };
        }
        return null;
    }

    componentWillUnmount() {
        this.destroyGame();
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
        if (this.game.handleEnterKey(this.state.currentMenuItem)) {
            this.setState({
                currentMenuItem: null,
            });
        }
    }

    handleGridClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pos = this.game.getMousePosition(e);
        this.game.moveCursorTo(pos);
        if (this.state.cursorMode === CURSOR_BEHAVIOR.MODERN) {
            this.game.paint();
        } else if (this.state.cursorMode === CURSOR_BEHAVIOR.CLASSIC) {
            //
        }
        this.setState({
            refresh: true,
        });
    }

    handleMouseMove = (e) => {
        this.setState({
            mouseLeft: e.clientX,
            mouseTop: e.clientY,
        }, () => {
            if (this.state.cursorMode === CURSOR_BEHAVIOR.MODERN) {
                this.game.moveCursorTo(this.game.getMousePosition(e));
                if (this.state.painting) {
                    this.game.paint();
                }
            }
        });
    }

    handleMouseOver = (e) => {
        this.setState({
            mouseOverGrid: true,
            mouseLeft: e.clientX,
            mouseTop: e.clientY,
        }, () => {
            if (this.state.cursorMode === CURSOR_BEHAVIOR.MODERN) {
                this.game.moveCursorTo(this.game.getMousePosition(e));
            }
        });
    }

    handleMouseLeave = (e) => {
        this.setState({
            mouseOverGrid: false,
        });
    }

    handleMouseDown = (e: MouseEvent) => {
        if (this.state.cursorMode !== CURSOR_BEHAVIOR.MODERN || e.button !== 0) {
            return;
        }

        this.setState({
            painting: true,
        });
    }

    handleMouseUp = (e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }

        this.setState({
            painting: false,
        });
    }

    handleKeyUp = (e: KeyboardEvent) => {
        //
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return; //don't override ctrl+btn browser hotkeys
        }
        switch (e.keyCode) {
            case KEYS.VK_RETURN:
                e.preventDefault();
                this.handleEnterRightClick();
                break;
            case KEYS.VK_BACK_QUOTE:
            case KEYS.VK_TILDE:
                //toggle debug display
                e.preventDefault();
                this.setState((prevState) => ({
                    debug: !prevState.debug,
                }));
                break;
            case KEYS.VK_ESCAPE:
                e.preventDefault();
                this.handleMenuEvent("escape");
                break;
            case KEYS.VK_UP:
            case KEYS.VK_NUMPAD8:
                //move north
                e.preventDefault();
                this.game.moveCursor(DIRECTION.N, e.shiftKey);
                break;
            case KEYS.VK_PAGE_UP:
            case KEYS.VK_NUMPAD9:
                //move ne
                e.preventDefault();
                this.game.moveCursor(DIRECTION.NE, e.shiftKey);
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_NUMPAD6:
                //move east
                e.preventDefault();
                this.game.moveCursor(DIRECTION.E, e.shiftKey);
                break;
            case KEYS.VK_PAGE_DOWN:
            case KEYS.VK_NUMPAD3:
                //move se
                e.preventDefault();
                this.game.moveCursor(DIRECTION.SE, e.shiftKey);
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_NUMPAD2:
                //move south
                e.preventDefault();
                this.game.moveCursor(DIRECTION.S, e.shiftKey);
                break;
            case KEYS.VK_END:
            case KEYS.VK_NUMPAD1:
                //move sw
                e.preventDefault();
                this.game.moveCursor(DIRECTION.SW, e.shiftKey);
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_NUMPAD4:
                //move west
                e.preventDefault();
                this.game.moveCursor(DIRECTION.W, e.shiftKey);
                break;
            case KEYS.VK_HOME:
            case KEYS.VK_NUMPAD7:
                //move nw
                e.preventDefault();
                this.game.moveCursor(DIRECTION.NW, e.shiftKey);
                break;
            case KEYS.VK_PERIOD:
            case KEYS.VK_GREATER_THAN:
                this.setState({
                    zLevel: this.game.zUp(),
                    hasChangedZLevel: true,
                });
                break;
            case KEYS.VK_COMMA:
            case KEYS.VK_LESS_THAN:
                this.setState({
                    zLevel: this.game.zDown(),
                    hasChangedZLevel: true,
                });
                break;
            default:
                const key = this.state.currentMenu !== "top" ? this.state.currentMenu + ":" + e.key : e.key;
                const hotkeyTarget = MENU_KEYS[key];
                if (hotkeyTarget) {
                    e.preventDefault();
                    this.handleMenuEvent(MENU_KEYS[key].id);
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
                currentMenuItem: null,
                currentMenu: "top",
            });
            return;
        }

        if (SUBMENUS[e] != null) {
            this.setState({
                currentMenuItem: null,
                currentMenu: SUBMENUS[e],
            });
            return;
        }

        if (e === "escape") {
            if (this.game.isBuilding()) {
                this.setState({
                    currentMenuItem: null,
                });
                this.game.stopBuilding();
            } else if (this.game.isDesignating()) {
                this.game.cancelDesignate();
            } else if (this.state.currentMenuItem != null) {
                this.setState({
                    currentMenuItem: null,
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
                    currentMenuItem: null,
                });
            }
        } else {
            if (this.state.currentMenuItem !== e) {
                this.setState({
                    currentMenuItem: e as MENU_ITEM,
                });
                //if this item is a building
                if (e === "inspect") {
                    //
                } else if (e in BUILDINGS) {
                    this.game.setCursorToBuilding(e as MENU_ITEM);
                }
            }
        }
    }

    handleStrictModeChange = (e: Event) => {
        this.setState({
            strictMode: (e.currentTarget as any).checked,
        });
        this.game.setStrictMode((e.currentTarget as any).checked);
    }

    isInspecting = () => {
        return this.state.currentMenuItem != null && this.state.currentMenuItem === "inspect";
    }

    getGridPosition = (clientX: number, clientY: number): [number, number] => {
        //returns top-left coordinate for grid item based on mouse position
        if (this.canvasElement != null) {
            const bounds = this.canvasElement.getBoundingClientRect();
            const maxHeight = this.canvasElement.offsetHeight - TILE_H + bounds.top;
            const maxWidth = this.canvasElement.offsetWidth - TILE_W + bounds.left;
            const leftPos = Math.max(0, Math.min(maxWidth, clientX - (clientX % TILE_W)));
            const topPos = Math.max(0, Math.min(maxHeight, clientY - (clientY % TILE_H)));
            return [leftPos, topPos];
        }
    }

    getHighlighterStyle = () => {
        if (!this.headerElement || !this.canvasElement ||
            !this.state.mouseOverGrid ||
            (this.state.mouseLeft == null || this.state.mouseTop == null)) {
            return {
                display: "none",
            };
        }
        const targetPos = this.getGridPosition(this.state.mouseLeft, this.state.mouseTop);
        return {
            width: `${TILE_W}px`,
            height: `${TILE_H}px`,
            left: targetPos[0],
            top: targetPos[1],
        };
    }

    getFooterDetails = (tile: Tile) => {
        const result = [];
        const pos = tile.getPosition();
        result.push((
            <div class="info-coord">{`[${pos[0]},${pos[1]}]`}</div>
        ));
        const type = tile.getType();
        switch (type) {
            case TileType.Building:
                result.push((
                    <div class="info-bldg">{tile.getBuildingName()} (Building)</div>
                ));
                break;
            case TileType.Empty:
                break;
            default:
                result.push((
                    <div class="info-type">{TileType[type]}</div>
                ));
                break;
        }

        return result;
    }

    renderFooterMouse = () => {
        if (this.game == null) {
            return;
        }

        if (!this.state.mouseOverGrid) {
            return;
        }

        const tile = this.game.getTileAtMouse(this.state.mouseLeft, this.state.mouseTop);
        if (tile) {
            return this.getFooterDetails(tile);
        }
    }

    renderFooterCursor = () => {
        if (this.game == null) {
            return;
        }
        const result = [];
        const tile: Tile = this.game.getTileAtCursor();
        if (tile) {
            result.push(this.getFooterDetails(tile));
        }
        if (this.game.isDesignating()) {
            result.push((
                <div class="info-status">Designating {MENU_IDS[this.state.currentMenuItem].text}</div>
            ));
        }
        return result;
    }

    renderBreadcrumbs = () => {
        const breadcrumbs = [];
        if (this.state.currentMenu !== "top") {
            const activeItem = MENU_KEYS[this.state.currentMenu];
            breadcrumbs.push(<a href="#" data-id={activeItem.key} onClick={(e) => this.breadcrumbHandler(e)}>{activeItem.text}</a>);

            // let parent = activeItem.parent;
            // while (parent != null) {
            //     breadcrumbs.push(<a href="#" data-id={parent.key} onClick={(e) => this.breadcrumbHandler(e)}>{parent.text}</a>);
            //     parent = parent.parent;
            // }
        }

        breadcrumbs.push(<a href="#" data-id="top" title="Main Menu" onClick={(e) => this.breadcrumbHandler(e)}>☺</a>);
        return breadcrumbs.reverse();
    }

    breadcrumbHandler = (e: Event) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
        const key = (e.currentTarget as HTMLElement).dataset.id;
        if (key === "top") {
            this.handleMenuEvent("top");
        } else if (MENU_KEYS[key] != null) {
            this.handleMenuEvent(MENU_KEYS[key].id);
        }
    }

    renderMenuToolbar = () => {
        // shows if a building is selected
        return (
            <div class="menu-toolbar">
                TOOLBAR
            </div>
        );
    }

    renderMenuStatus = () => {
        if (this.game == null) {
            return null;
        }
        if (this.game.isDesignating()) {
            return (
                <div>Designating {MENU_IDS[this.state.currentMenuItem].text}</div>
            );
        }
        if (this.state.currentMenuItem != null && this.state.currentMenuItem.length > 0) {
            if (this.state.currentMenuItem in BUILDINGS) {
                return (
                    <div>Placing {MENU_IDS[this.state.currentMenuItem].text}</div>
                );
            }
            return (
                <div>Designating {MENU_IDS[this.state.currentMenuItem].text}</div>
            );
        }
        return <div></div>;
    }

    render(props, state: IFortressDesignerState) {
        return (
            <div id="page">
                {DEBUG ? <DebugMenu isActive={state.debug} /> : null}
                <div id="highlighter" class={state.cursorMode === CURSOR_BEHAVIOR.CLASSIC ? "classic" : "modern"} style={this.getHighlighterStyle()}></div>
                <div id="wrapper" style={this.getWrapperCss()}>
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
                    <div id="grid">
                        <div class="loading">
                            Loading...
                        </div>
                    </div>
                    <div id="menu">
                        <div class="menu-breadcrumbs">
                            {this.renderBreadcrumbs()}
                        </div>
                        <Menu highlightedItem={state.currentMenuItem}
                            selectedMenu={state.currentMenu}
                            handleMenuEvent={this.handleMenuEvent} />
                        <div class="menu-bottom">
                            {this.renderMenuToolbar()}
                            <div class="menu-status">
                                {this.renderMenuStatus()}
                            </div>
                            <div class="strict-mode">
                                <input id="strictmode" checked={state.strictMode} type="checkbox" onChange={this.handleStrictModeChange} />
                                <label title="Toggle Strict Mode" for="strictmode">Strict Mode:</label>
                            </div>
                            <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
                        </div>
                    </div>
                    <footer id="footer">
                        <div class="inner">
                            <div class="data-cursor">Cursor: {this.renderFooterCursor()}</div>
                            <div class="data-mouse">Mouse: {this.renderFooterMouse()}</div>
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
