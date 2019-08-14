//libraries
import * as _ from "lodash";
import { Component, h, render } from "preact";
import { connect, Provider } from "react-redux";
//components
import { BUILDINGS, DEBUG, HEADER_H, KEYS, MENU_IDS, MENU_ITEM, MENU_KEYS, MENU_W, Point, SUBMENUS, TILE_H, TILE_URL, TILE_W } from "./components/constants";
import { DebugMenu } from "./components/debug";
import { CURSOR_BEHAVIOR } from "./components/enums";
import { Game } from "./components/game";
import GameHighlighter from "./components/game/highlighter";
import { Menu } from "./components/menu";
import { moveCursor } from "./components/redux/cursor/actions";
import { endHighlight, setHighlightPos, startHighlight } from "./components/redux/highlighter/actions";
import { goToSubmenu, selectMenuItem } from "./components/redux/menu/actions";
import { mouseLeftPressed, mouseOverGrid } from "./components/redux/mouse/actions";
import { setStrictMode } from "./components/redux/settings/actions";
import store, { ReduxState } from "./components/redux/store";

require("./css/index.scss");

declare global {
    // tslint:disable-next-line: interface-name
    interface Window {
        mouseX: number;
        mouseY: number;
    }
}

/*
? Add drag support to tilegrid
. Ability to click on sidebar item and modify cursor hover/click behavior
. Add drag behavior option - rectangular select or paint
    (select rectangular area to modify/move/clear or 'paint' - select every item the cursor directly moves over)
'?: Help' Menu?
Add google analytics + simple text ads before public release?
*/

interface IRootReduxProps {
    zLevel: number;
    currentMenu: string;
    currentMenuItem: MENU_ITEM;
    strictMode: boolean;
    // mouseOverGrid: boolean;
    leftMouseDown: boolean;
    highlighting: boolean; // if user is click+drag on INSPECT
    highlightingStart: Point;
    cursorMode: CURSOR_BEHAVIOR;
    cursorBuilding: boolean;
    inspecting: boolean;
    isDesignating: boolean;
    // camera: Point;
}

interface IRootDispatchProps {
    moveCursor: (pos: Point) => void;
    selectMenu: (item: string) => void;
    selectMenuItem: (item: MENU_ITEM) => void;
    startHighlight: () => void;
    // mouseOverGrid: (val: boolean) => void;
    mouseLeftPressed: (val: boolean) => void;
    setHighlightPos: (pos: Point) => void;
    endHighlight: () => void;
    setStrictMode: (val: boolean) => void;
}

const mapStateToProps = (state: ReduxState): IRootReduxProps => {
    return {
        zLevel: state.camera.zLevel,
        currentMenu: state.menu.currentMenu,
        currentMenuItem: state.menu.currentMenuItem,
        inspecting: state.menu.inspecting,
        strictMode: state.settings.strictMode,
        // mouseOverGrid: state.mouse.mouseOverGrid,
        leftMouseDown: state.mouse.leftMouseDown,
        highlighting: state.highlighter.highlighting,
        highlightingStart: state.highlighter.highlightingStart,
        cursorMode: state.settings.cursorMode,
        cursorBuilding: state.cursor.cursorBuilding,
        isDesignating: state.designator.isDesignating,
        // camera: state.camera.camera,
    };
};

const mapDispatchToProps = (dispatch: typeof store.dispatch): IRootDispatchProps => {
    return {
        moveCursor: (pos) => {
            dispatch(moveCursor(pos) as any);
        },
        selectMenuItem: (item) => {
            dispatch(selectMenuItem(item));
        },
        selectMenu: (item) => {
            dispatch(goToSubmenu(item));
        },
        startHighlight: () => {
            dispatch(startHighlight());
        },
        // mouseOverGrid: (val) => {
        //     dispatch(mouseOverGrid(val));
        // },
        mouseLeftPressed: (val) => {
            dispatch(mouseLeftPressed(val));
        },
        setHighlightPos: (pos) => {
            dispatch(setHighlightPos(pos));
        },
        endHighlight: () => {
            dispatch(endHighlight());
        },
        setStrictMode: (val) => {
            dispatch(setStrictMode(val));
        },
    };
};

// only things relevant to HTML state
interface IFortressDesignerState {
    debug: boolean;
    gridColumnLayout: number;
    gridRowLayout: number;

    // hasChangedZLevel: boolean;
    windowResizing: boolean;
    gameLoading: boolean;

    /**
     * Only used to trigger react re-renders
     */
    refresh: boolean;
}

class FortressDesigner extends Component<IRootReduxProps & IRootDispatchProps, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private tileSheetImage: HTMLImageElement;
    private game: Game;
    private listenersOn: boolean;

    private canvasRef: any;

    constructor() {
        super();

        this.listenersOn = false;

        this.setState({
            debug: false,
            windowResizing: false,
            gameLoading: true,
            gridColumnLayout: 0,
            gridRowLayout: 0,
        });
    }

    componentDidMount = () => {
        this.gridElement = document.getElementById("grid");

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
            this.game = new Game(this.tileSheetImage, this.gridElement, this.canvasRef);
        } else {
            this.game.init();
        }

        if (!this.listenersOn) {
            // this.gridElement.addEventListener("click", this.handleGridClick);
            this.gridElement.addEventListener("mousemove", this.handleMouseMove);
            this.gridElement.addEventListener("mouseover", this.handleMouseOver);
            // this.gridElement.addEventListener("mouseleave", this.handleMouseLeave);
            // this.gridElement.addEventListener("contextmenu", this.handleContextMenu);
            // this.gridElement.addEventListener("mousedown", this.handleMouseDown);
            // this.gridElement.addEventListener("mouseup", this.handleMouseUp);

            this.listenersOn = true;
        }

        this.setState({
            gameLoading: false,
        });
    }

    destroyGame = () => {
        if (this.game == null) {
            return;
        }

        this.game.destroy();

        // if (this.canvasElement != null) {
        //     this.canvasElement.remove();
        //     this.canvasElement = null;
        // }

        if (this.listenersOn) {
            // this.gridElement.removeEventListener("click", this.handleGridClick);
            this.gridElement.removeEventListener("mousemove", this.handleMouseMove);
            this.gridElement.removeEventListener("mouseover", this.handleMouseOver);
            // this.gridElement.removeEventListener("mouseleave", this.handleMouseLeave);
            // this.gridElement.removeEventListener("contextmenu", this.handleContextMenu);
            // this.gridElement.removeEventListener("mousedown", this.handleMouseDown);
            // this.gridElement.removeEventListener("mouseup", this.handleMouseUp);

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

    componentWillUnmount = () => {
        this.destroyGame();
    }

    handleMouseMove = (e) => {
        // this.props.moveMouse([e.clientX, e.clientY]);
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
        // if (this.props.inspecting) {
        //     if (this.props.leftMouseDown) {
        //         // this.setState({
        //         //     highlighting: true, //don't show inspect highlighter until mouse moves after click
        //         // });
        //         this.props.startHighlight();
        //     }
        // } else if (this.props.cursorMode === CURSOR_BEHAVIOR.MODERN || this.props.isDesignating) {
        //     // const trg = this.game.getMousePosition(e);
        //     const trg = [window.mouseX, window.mouseY] as Point;
        //     // this.game.moveCursorTo(trg);
        //     this.props.moveCursor(trg);
        //     if (this.props.leftMouseDown) {
        //         // if (this.game.paint(this.props.currentMenuItem)) {
        //         //     // this.setState({
        //         //     //     currentMenuItem: null,
        //         //     // });
        //         //     this.props.selectMenuItem(null);
        //         // }
        //     }
        // }
        // // this.setState({
        // //     mouseLeft: e.clientX,
        // //     mouseTop: e.clientY,
        // // }, () => {
        // //     if (this.game == null) {
        // //         return;
        // //     }
        // //     if (this.props.inspecting) {
        // //         if (this.props.leftMouseDown) {
        // //             this.setState({
        // //                 highlighting: true, //don't show inspect highlighter until mouse moves after click
        // //             });
        // //         }
        // //     } else if (this.props.cursorMode === CURSOR_BEHAVIOR.MODERN || this.game.isDesignating()) {
        // //         // const trg = this.game.getMousePosition(e);
        // //         const trg = [window.mouseX, window.mouseY];
        // //         this.game.moveCursorTo(trg);
        // //         if (this.props.leftMouseDown) {
        // //             if (this.game.paint(this.props.currentMenuItem)) {
        // //                 this.setState({
        // //                     currentMenuItem: null,
        // //                 });
        // //             }
        // //         }
        // //     }
        // // });
    }

    handleMouseOver = (e) => {
        // this.props.moveMouse([e.clientX, e.clientY]);
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
        // this.props.mouseOverGrid(true);
        // if (this.props.cursorMode === CURSOR_BEHAVIOR.MODERN) {
        //     // this.props.moveCursor([window.mouseX, window.mouseY]);
        //     const gridPos = this.getGridPosition(window.mouseX, window.mouseY);
        //     const mapPos = Util.getMapCoord(gridPos);
        //     this.props.moveCursor(mapPos);
        // }
        // this.setState({
        //     mouseOverGrid: true,
        //     mouseLeft: e.clientX,
        //     mouseTop: e.clientY,
        // }, () => {
        //     if (this.props.cursorMode === CURSOR_BEHAVIOR.MODERN) {
        //         //this.game.moveCursorTo(this.game.getMousePosition(e));
        //         this.game.moveCursorTo([window.mouseX, window.mouseY]);
        //     }
        // });
    }

    // handleMouseLeave = (e) => {
    //     this.props.mouseOverGrid(false);
    // }

    handleKeyUp = (e: KeyboardEvent) => {
        //
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return; //don't override ctrl+btn browser hotkeys
        }
        switch (e.keyCode) {
            // case KEYS.VK_RETURN:
            //     e.preventDefault();
            //     // this.handleEnterRightClick();
            //     break;
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
                if (this.props.currentMenuItem != null) {
                    this.props.selectMenuItem(null);
                } else {
                    // go up one menu level
                    let newMenu = "";
                    const idx = this.props.currentMenu.lastIndexOf(":");
                    if (idx > 0) {
                        newMenu = this.props.currentMenu.substr(0, idx);
                    } else {
                        newMenu = "top";
                    }
                    this.props.selectMenu(newMenu);
                }
                break;
            default:
                break;
        }
        this.setState({
            refresh: true,
        });
    }

    render(props, state: IFortressDesignerState) {
        return (
            <div id="page">
                {DEBUG ? <DebugMenu isActive={state.debug} /> : null}
                <GameHighlighter canvasRef={this.canvasRef} inspecting={props.inspecting} />
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
                        <canvas ref={(e) => this.canvasRef = e}></canvas>
                    </div>
                    <Menu currentMenuItem={props.currentMenuItem}
                        currentMenu={props.currentMenu}
                        strictMode={props.strictMode}
                        isDesignating={props.isDesignating}
                        selectMenu={props.selectMenu}
                        selectMenuItem={props.selectMenuItem}
                        setStrictMode={props.setStrictMode} />
                    <footer id="footer">
                        <div class="inner">
                            {/* <div class="data-cursor">Cursor: {this.renderFooterCursor()}</div>
                            <div class="data-mouse">Mouse: {this.renderFooterMouse()}</div> */}
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

const ConnectedFortressDesigner = connect(mapStateToProps, mapDispatchToProps)(FortressDesigner);

render(<Provider store={store}><ConnectedFortressDesigner /></Provider>, document.getElementById("body"));

    // handleMenuEvent = (e: string) => {
    //     if (e == null || e.length === 0) {
    //         return;
    //     }

    //     // if (e === "inspect") {
    //     //     this.game.hideCursor();
    //     // } else {
    //     //     this.game.showCursor();
    //     // }

    //     if (e === "top") {
    //         // this.setState({
    //         //     currentMenuItem: null,
    //         //     currentMenu: "top",
    //         // });
    //         this.props.selectMenu("top");
    //         return;
    //     }

    //     if (SUBMENUS[e] != null) {
    //         // this.setState({
    //         //     currentMenuItem: null,
    //         //     currentMenu: SUBMENUS[e],
    //         // });
    //         this.props.selectMenu(SUBMENUS[e]);
    //         return;
    //     }

    //     if (e === "escape") {
    //         // if (this.props.cursorBuilding) {
    //         //     // this.setState({
    //         //     //     currentMenuItem: null,
    //         //     // });
    //         //     // this.game.stopBuilding();
    //         //     this.game.handleEscapeKey();
    //         // } else if (this.game.isDesignating()) {
    //         //     // this.game.cancelDesignate();
    //         if (this.props.cursorBuilding || this.props.isDesignating) {
    //             this.game.handleEscapeKey();
    //         } else if (this.props.currentMenuItem != null) {
    //             this.props.selectMenuItem(null);
    //         } else {
    //             // go up one menu level
    //             let newMenu = "";
    //             const idx = this.props.currentMenu.lastIndexOf(":");
    //             if (idx > 0) {
    //                 newMenu = this.props.currentMenu.substr(0, idx);
    //             } else {
    //                 newMenu = "top";
    //             }
    //             this.props.selectMenu(newMenu);
    //         }
    //     } else {
    //         if (this.props.currentMenuItem !== e) {
    //             this.props.selectMenuItem(e as MENU_ITEM);
    //             // this.setState({
    //             //     currentMenuItem: e as MENU_ITEM,
    //             // });
    //             if (e in BUILDINGS) {
    //                 // this.game.setCursorToBuilding(e as MENU_ITEM);
    //             }
    //         }
    //     }
    // }

    // getFooterDetails = (tile: Tile) => {
    //     const result = [];
    //     const pos = tile.getPosition();
    //     result.push((
    //         <div class="info-coord">{`[${pos[0]},${pos[1]}]`}</div>
    //     ));
    //     const type = tile.getType();
    //     switch (type) {
    //         case TileType.Building:
    //             result.push((
    //                 <div class="info-bldg">{tile.getBuildingName()} (Building)</div>
    //             ));
    //             break;
    //         case TileType.Empty:
    //             break;
    //         default:
    //             result.push((
    //                 <div class="info-type">{TileType[type]}</div>
    //             ));
    //             break;
    //     }

    //     return result;
    // }

    // renderFooterMouse = () => {
    //     if (this.game == null) {
    //         return;
    //     }

    //     if (!this.props.mouseOverGrid) {
    //         return;
    //     }

    //     const tile = this.game.getTileAtMouse(window.mouseX, window.mouseY);
    //     if (tile) {
    //         return this.getFooterDetails(tile);
    //     }
    // }

    // renderFooterCursor = () => {
    //     if (this.game == null) {
    //         return;
    //     }
    //     const result = [];
    //     const tile: Tile = this.game.getTileAtCursor();
    //     if (tile) {
    //         result.push(this.getFooterDetails(tile));
    //     }
    //     if (this.game.isDesignating()) {
    //         result.push((
    //             <div class="info-status">Designating {MENU_IDS[this.props.currentMenuItem].text}</div>
    //         ));
    //     }
    //     return result;
    // }

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
