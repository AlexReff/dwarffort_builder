import { Component, h } from "preact";
import { connect } from "react-redux";
import { Point, TILE_H, TILE_W } from "./constants";
import { inspectTileAtPos } from "./redux/inspect/actions";
import { ReduxState } from "./redux/store";

interface IGameHighlighterProps {
    canvasRef: any;
    //redux
    inspecting: boolean;
    inspectTile: (x, y) => void;
}

interface IGameHighlighterState {
    highlightingStart: Point;
    currentPosition: Point;
    mouseDown: boolean;
    showHighlighter: boolean;
}

const mapStateToProps = (state: ReduxState) => ({
    // currentMenu: state.menu.currentMenu,
    // currentMenuItem: state.menu.currentMenuItem,
    inspecting: state.inspect.inspecting,
    // isDesignating: state.designator.isDesignating,
    // strictMode: state.settings.strictMode,
});

const mapDispatchToProps = (dispatch) => ({
    inspectTile: (x, y) => dispatch(inspectTileAtPos(x, y)),
    // selectMenu: (id) => dispatch(selectMenu(id)),
    // selectMenuItem: (id) => dispatch(selectMenuItem(id)),
    // setStrictMode: (val) => dispatch(setStrictMode(val)),
});

class GameHighlighter extends Component<IGameHighlighterProps, any> {
    componentDidMount = () => {
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (this.props.canvasRef != null && this.props.inspecting) {
            const targ: any = "touches" in e ? e.touches : e;
            const newPos = this.getHighlighterGridPosition(targ.clientX, targ.clientY);
            this.setState((prevState: IGameHighlighterState) => ({
                showHighlighter: prevState.showHighlighter ? true : prevState.mouseDown && (prevState.highlightingStart[0] !== newPos[0] || prevState.highlightingStart[1] !== newPos[1]),
                currentPosition: newPos,
            }));
        }
    }

    handleMouseDown = (e: MouseEvent | TouchEvent) => {
        if (this.props.canvasRef != null && this.props.inspecting) {
            const path = e.composedPath();
            if (path.some((p: any) => p.nodeName != null && p.nodeName.toLowerCase() === "canvas")) {
                const targ: any = "touches" in e ? e.touches : e;
                this.setState({
                    mouseDown: true,
                    showHighlighter: false,
                    highlightingStart: this.getHighlighterGridPosition(targ.clientX, targ.clientY),
                });
            }
        }
    }

    handleMouseUp = (e: MouseEvent | TouchEvent) => {
        if (this.props.canvasRef != null) {
            const path = e.composedPath();
            if (path.some((p: any) => p.nodeName != null && p.nodeName.toLowerCase() === "canvas")) {
                const eTarg: any = "touches" in e ? e.touches : e;
                if (this.props.inspecting) {
                    if (this.state.showHighlighter) {
                        //handle area selection
                        console.log("inspect drag");
                    } else {
                        //handle single-click on item
                        this.props.inspectTile(eTarg.clientX, eTarg.clientY);
                    }
                }
                this.setState({
                    mouseDown: false,
                    showHighlighter: false,
                });
            }
        }
    }

    getHighlighterStyle = () => {
        if (this.props.canvasRef == null ||
            !this.state.mouseDown ||
            this.state.currentPosition == null ||
            this.state.currentPosition.length !== 2 ||
            this.state.highlightingStart == null ||
            this.state.highlightingStart.length !== 2) {
            return {};
        }
        const width = +TILE_W + Math.abs(this.state.currentPosition[0] - this.state.highlightingStart[0]);
        const height = +TILE_H + Math.abs(this.state.currentPosition[1] - this.state.highlightingStart[1]);
        const left = Math.min(this.state.currentPosition[0], this.state.highlightingStart[0]);
        const top = Math.min(this.state.currentPosition[1], this.state.highlightingStart[1]);
        return {
            width: `${width}px`,
            height: `${height}px`,
            left,
            top,
        };
    }

    /**
     * @returns top-left coordinate for grid item based on mouse position
     */
    getHighlighterGridPosition = (clientX: number, clientY: number): [number, number] => {
        if (this.props.canvasRef != null) {
            const bounds = this.props.canvasRef.getBoundingClientRect();
            const maxHeight = this.props.canvasRef.offsetHeight - TILE_H + bounds.top;
            const maxWidth = this.props.canvasRef.offsetWidth - TILE_W + bounds.left;
            const leftPos = Math.max(0, Math.min(maxWidth, clientX - (clientX % TILE_W)));
            const topPos = Math.max(0, Math.min(maxHeight, clientY - (clientY % TILE_H)));
            return [leftPos, topPos];
        }
    }

    render = (props, state) => {
        return (
            <div id="highlighter" class={state.showHighlighter ? "active" : null} style={this.getHighlighterStyle()}></div>
        );
    }
}

// export default GameHighlighter;

export default connect(mapStateToProps, mapDispatchToProps)(GameHighlighter);
