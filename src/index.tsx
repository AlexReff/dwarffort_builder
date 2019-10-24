//libraries
import { Component, h, render } from "preact";
import { Provider } from "react-redux";
//components
import { HEADER_H, MENU_W, TILE_H, TILE_URL, TILE_W } from "./components/constants";
import { Game } from "./components/game";
import DebugMenu from "./components/react/debug/";
import Footer from "./components/react/footer/";
import Header from "./components/react/header/";
import Highlighter from "./components/react/highlighter/";
import Menu from "./components/react/menu/";
import { Initialize, resizeWindow, store } from "./components/redux/";
import { debounce } from "./components/util";

require("./css/index.scss");

interface IFortressDesignerState {
    gameLoading: boolean;
}

class FortressDesigner extends Component<{}, IFortressDesignerState> {
    private gridElement: HTMLElement;
    private tileSheetImage: HTMLImageElement;
    private game: Game;
    private lastGridTemplateRow: number;
    private lastGridTemplateCol: number;

    constructor() {
        super();

        this.lastGridTemplateRow = 0;
        this.lastGridTemplateCol = 0;

        this.setState({
            gameLoading: true,
        });
    }

    componentDidMount = () => {
        this.gridElement = document.getElementById("grid");

        this.tileSheetImage = new Image();
        this.tileSheetImage.crossOrigin = "Anonymous";
        this.tileSheetImage.id = "tilesheet";
        this.tileSheetImage.onload = () => {
            this.initGame();
        };

        window.addEventListener("resize", this.handleWindowResize);

        store.dispatch(Initialize(this.gridElement));

        this.tileSheetImage.src = TILE_URL; //keep this as last line to ensure onload runs after rest of code
    }

    initGame = () => {
        if (this.game == null) {
            this.game = new Game(document.getElementById("canvas") as HTMLCanvasElement, this.tileSheetImage);
        } else {
            this.game.restart();
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

        this.setState({
            gameLoading: true,
        });

        // this.game = null;
    }

    componentWillUnmount = () => {
        this.destroyGame();
    }

    //#region window resizing

    setWindowResizing = () => {
        this.destroyGame();
    }

    endWindowResizing = () => {
        store.dispatch(resizeWindow(this.gridElement));
        this.initGame();
    }

    // tslint:disable-next-line: member-ordering
    windowResizeBouncer = debounce(this.setWindowResizing, 300, true);

    // tslint:disable-next-line: member-ordering
    windowResizeEndBouncer = debounce(this.endWindowResizing, 400, false);

    handleWindowResize = () => {
        this.windowResizeBouncer();
        this.windowResizeEndBouncer();
    }

    //#endregion

    getWrapperCss = () => {
        if (this.state.gameLoading) {
            this.lastGridTemplateRow = 0;
            this.lastGridTemplateCol = 0;
            return {};
        }

        this.lastGridTemplateCol = (this.gridElement.offsetWidth - this.lastGridTemplateCol) % TILE_W;
        this.lastGridTemplateRow = (this.gridElement.offsetHeight - this.lastGridTemplateRow) % TILE_H;

        return {
            gridTemplateColumns: `1fr ${(MENU_W + this.lastGridTemplateCol).toString()}px`,
            gridTemplateRows: `${HEADER_H.toString()}px 1fr ${(HEADER_H + this.lastGridTemplateRow).toString()}px`,
        };
    }

    getCenterCss = () => {
        if (this.lastGridTemplateRow === 0 && this.lastGridTemplateCol === 0) {
            return {
                margin: "auto 0",
            };
        }
        return {};
    }

    render(props: any, state: IFortressDesignerState) {
        return (
            <div id="page">
                <Highlighter />
                <DebugMenu />
                <div id="wrapper" style={this.getWrapperCss()}>
                    <div id="header">
                        <div class="left"><a class="home-link" href="https://reff.dev/">reff.dev</a></div>
                        <div class="center" style={this.getCenterCss()}>
                            <a href="/" class="title">Fortress Designer</a>
                        </div>
                        <div class="right">
                            <Header />
                        </div>
                    </div>
                    <div id="grid">
                        <div class="loading">
                            Loading...
                        </div>
                        <canvas id="canvas"></canvas>
                    </div>
                    <Menu />
                    <Footer />
                </div>
            </div>
        );
    }
}

render(<Provider store={store}><FortressDesigner /></Provider>, document.getElementById("body"));
