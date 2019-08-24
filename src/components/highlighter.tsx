import { Component, h } from "preact";
import { connect } from "react-redux";
import { KEYS, Point, TILE_H, TILE_W } from "./constants";
import { IBuildingState } from "./redux/building/reducer";
import { ICameraState } from "./redux/camera/reducer";
import { inspectTileAtMapCoord, inspectTileAtPos, inspectTileRange } from "./redux/inspect/actions";
import { IInspectState } from "./redux/inspect/reducer";
import { ReduxState } from "./redux/store";

interface IGameHighlighterProps {
    canvasRef: any;
    //redux props
    camera: ICameraState["camera"];
    inspecting: IInspectState["inspecting"];
    buildingList: IBuildingState["buildingList"];
    buildingBounds: IBuildingState["buildingBounds"];
    inspectedBuildings: IInspectState["inspectedBuildings"];
    zLevel: ICameraState["zLevel"];
    //redux dispatch
    inspectTileAtPos: typeof inspectTileAtPos;
    inspectTileAtMapCoord: typeof inspectTileAtMapCoord;
    inspectTileRange: typeof inspectTileRange;
}

interface IGameHighlighterState {
    highlightingStart: Point;
    currentPosition: Point;
    mouseDown: boolean;
    mouseDownCoord: Point;
    showHighlighter: boolean;
    shiftDown: boolean;
}

const mapStateToProps = (state: ReduxState) => ({
    camera: state.camera.camera,
    inspecting: state.inspect.inspecting,
    inspectedBuildings: state.inspect.inspectedBuildings,
    buildingList: state.building.buildingList,
    buildingBounds: state.building.buildingBounds,
    zLevel: state.camera.zLevel,
});

const mapDispatchToProps = (dispatch) => ({
    inspectTileAtPos: (x, y, add) => dispatch(inspectTileAtPos(x, y, add)),
    inspectTileRange: (first, second, add) => dispatch(inspectTileRange(first, second, add)),
    inspectTileAtMapCoord: (coord, shift) => dispatch(inspectTileAtMapCoord(coord, shift)),
});

class GameHighlighter extends Component<IGameHighlighterProps, IGameHighlighterState> {
    constructor() {
        super();
        this.setState({
            shiftDown: false,
        });
    }

    componentDidMount = () => {
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: true,
            });
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: false,
            });
        }
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
                    mouseDownCoord: [targ.clientX, targ.clientY],
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
                        this.props.inspectTileRange(this.state.mouseDownCoord, this.state.currentPosition, this.state.shiftDown);
                    } else {
                        //handle single-click on item
                        this.props.inspectTileAtPos(eTarg.clientX, eTarg.clientY, this.state.shiftDown);
                    }
                }
                this.setState({
                    mouseDown: false,
                    mouseDownCoord: null,
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

    getInspectTiles = () => {
        if (this.props.canvasRef == null ||
            this.props.buildingList == null) {
            return null;
        }

        const result = [];

        for (const key of Object.values(this.props.buildingList)) {
            const range = this.props.buildingBounds[key];
            const canvasBounds = this.props.canvasRef.getBoundingClientRect();

            const width = +TILE_W + (+TILE_W * Math.abs(range[1][0] - range[0][0]));
            const height = +TILE_H + (+TILE_H * Math.abs(range[1][1] - range[0][1]));

            const leftGrid = Math.min(range[1][0], range[0][0]) - this.props.camera[0];
            const topGrid = Math.min(range[1][1], range[0][1]) - this.props.camera[1];

            const left = canvasBounds.left + (+TILE_W * leftGrid);
            const top = canvasBounds.top + (+TILE_H * topGrid);

            const style = {
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}px`,
                top: `${top}px`,
            };

            let thisClass = "building_inspect";
            if (this.props.inspectedBuildings != null) {
                for (let x = range[0][0]; x <= range[1][0]; x++) {
                    for (let y = range[0][1]; y <= range[1][1]; y++) {
                        if (this.props.inspectedBuildings.some((m) => m === `${this.props.zLevel}:${x}:${y}`)) {
                            thisClass += " inspecting";
                            x = range[1][0]; //break both loops
                            break;
                        }
                    }
                }
            }

            const handleClick = (e: TouchEvent | MouseEvent) => {
                e.preventDefault();
                this.props.inspectTileAtMapCoord(range[0], this.state.shiftDown);
            };

            result.push((
                <a class={thisClass} title={range.display_name} onClick={handleClick} style={style}></a>
            ));
        }

        let wrapperClass = "inspect_wrapper";
        if (this.props.inspecting) {
            wrapperClass += " inspecting";
        }
        if (this.state.mouseDown) {
            wrapperClass += " dragging";
        }

        return (
            <div class={wrapperClass}>
                {result}
            </div>
        );
    }

    render = (props: IGameHighlighterProps, state: IGameHighlighterState) => {
        let stack = [];
        stack.push((
            <div id="highlighter" class={state.showHighlighter ? "active" : null} style={this.getHighlighterStyle()}></div>
        ));

        stack = stack.concat(this.getInspectTiles());

        return stack;
    }
}

// export default GameHighlighter;

export default connect(mapStateToProps, mapDispatchToProps)(GameHighlighter);
