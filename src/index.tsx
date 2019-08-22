//libraries
import * as _ from "lodash";
import { Component, h, render } from "preact";
import { connect, Provider } from "react-redux";
//components
import { DEBUG, HEADER_H, KEYS, MENU_ITEM, MENU_W, TILE_URL, TILE_W } from "./components/constants";
import { DebugMenu } from "./components/debug";
import { Game } from "./components/game/game";
import GameHighlighter from "./components/highlighter";
import Menu from "./components/menu";
import store, { ReduxState } from "./components/redux/store";

require("./css/index.scss");

interface IFortressDesignerState {
    debug: boolean;
    gridColumnLayout: number;
    gridRowLayout: number;
    windowResizing: boolean;
    gameLoading: boolean;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private tileSheetImage: HTMLImageElement;
    private game: Game;
    private canvasRef: any;

    constructor() {
        super();

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
        window.addEventListener("resize", this.handleWindowResize);
    }

    initGame = () => {
        if (this.game == null) {
            this.game = new Game(this.tileSheetImage, this.gridElement, this.canvasRef);
        } else {
            this.game.init();
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
    }

    componentWillUnmount = () => {
        this.destroyGame();
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

    handleWindowResize = () => {
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

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return;
        }
        switch (e.keyCode) {
            case KEYS.VK_BACK_QUOTE:
            case KEYS.VK_TILDE:
                e.preventDefault();
                this.setState((prevState) => ({
                    debug: !prevState.debug,
                }));
                break;
            default:
                break;
        }
    }

    render(props, state: IFortressDesignerState) {
        return (
            <div id="page">
                {DEBUG ? <DebugMenu isActive={state.debug} /> : null}
                <GameHighlighter canvasRef={this.canvasRef} />
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
                    <Menu />
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

render(<Provider store={store}><FortressDesigner /></Provider>, document.getElementById("body"));
