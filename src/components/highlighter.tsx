import { Component, h } from "preact";
import { connect } from "react-redux";
import { KEYS, Point, TILE_H, TILE_W } from "./constants/";
import { ICameraState } from "./redux/camera/reducer";
import { ReduxState } from "./redux/store";

interface IGameHighlighterProps {
    canvasRef: any;
    //redux props
    cameraX: ICameraState["cameraX"];
    cameraY: ICameraState["cameraY"];
    // inspecting: IInspectState["inspecting"];
    // buildingList: IBuildingState["buildingList"];
    // buildingBounds: IBuildingState["buildingBounds"];
    // inspectedBuildings: IInspectState["inspectedBuildings"];
    cameraZ: ICameraState["cameraZ"];
    mapHeight: ICameraState["mapHeight"];
    mapWidth: ICameraState["mapWidth"];
    //redux dispatch
    // inspectTileAtPos: typeof inspectRequestAtPos;
    // inspectTileAtMapCoord: typeof inspectRequestAtMapCoord;
    // inspectTileRange: typeof inspectRequestRange;
    // inspectMoveSelectionRequest: typeof inspectMoveSelectionRequest;
}

interface IGameHighlighterState {
    highlightingStart: Point;
    currentPosition: Point;
    mouseDown: boolean;
    mouseDownCoord: Point;
    showHighlighter: boolean;
    shiftDown: boolean;
    toolbarMoveDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    mouseX: number;
    mouseY: number;
}

const mapStateToProps = (state: ReduxState) => ({
    cameraX: state.camera.cameraX,
    cameraY: state.camera.cameraY,
    // inspecting: state.inspect.inspecting,
    // inspectedBuildings: state.inspect.inspectedBuildings,
    // buildingList: state.building.buildingList,
    // buildingBounds: state.building.buildingBounds,
    mapHeight: state.camera.mapHeight,
    mapWidth: state.camera.mapWidth,
});

const mapDispatchToProps = (dispatch) => ({
    // inspectTileAtPos: (x, y, add) => dispatch(inspectRequestAtPos(x, y, add)),
    // inspectTileRange: (first, second, add) => dispatch(inspectRequestRange(first, second, add)),
    // inspectTileAtMapCoord: (coord, shift) => dispatch(inspectRequestAtMapCoord(coord, shift)),
    // inspectMoveSelectionRequest: (payload) => dispatch(inspectMoveSelectionRequest(payload)),
});

class GameHighlighter extends Component<IGameHighlighterProps, IGameHighlighterState> {
    allInspectStartLeft: number;
    allInspectStartTop: number;
    allInspectLeft: number;
    allInspectTop: number;

    constructor() {
        super();
        this.setState({
            mouseDown: false,
            showHighlighter: false,
            shiftDown: false,
            toolbarMoveDragging: false,
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
        // if (this.props.canvasRef != null && this.props.inspecting) {
        //     const targ: any = "touches" in e ? e.touches : e;
        //     const newPos = this.getHighlighterGridPosition(targ.clientX, targ.clientY);
        //     this.setState((prevState: IGameHighlighterState) => ({
        //         showHighlighter: prevState.showHighlighter ? true : prevState.mouseDown && (prevState.highlightingStart[0] !== newPos[0] || prevState.highlightingStart[1] !== newPos[1]),
        //         currentPosition: newPos,
        //         mouseX: targ.clientX,
        //         mouseY: targ.clientY,
        //     }));
        // }
    }

    handleMouseDown = (e: MouseEvent | TouchEvent) => {
        // if (this.props.canvasRef != null && this.props.inspecting) {
        //     const path = e.composedPath();
        //     if (path.some((p: any) => p.nodeName != null && p.nodeName.toLowerCase() === "canvas")) {
        //         const targ: any = "touches" in e ? e.touches : e;
        //         this.setState({
        //             mouseDown: true,
        //             mouseDownCoord: [targ.clientX, targ.clientY],
        //             showHighlighter: false,
        //             highlightingStart: this.getHighlighterGridPosition(targ.clientX, targ.clientY),
        //         });
        //     }
        // }
    }

    handleMouseUp = (e: MouseEvent | TouchEvent) => {
        // if (this.props.canvasRef != null) {
        //     const path = e.composedPath();
        //     if (path.some((p: any) => p.nodeName != null && p.nodeName.toLowerCase() === "canvas")) {
        //         const eTarg: any = "touches" in e ? e.touches : e;
        //         if (this.props.inspecting) {
        //             if (this.state.showHighlighter) {
        //                 //handle area selection
        //                 this.props.inspectTileRange(this.state.mouseDownCoord, this.state.currentPosition, this.state.shiftDown);
        //             } else {
        //                 //handle single-click on item
        //                 this.props.inspectTileAtPos(eTarg.clientX, eTarg.clientY, this.state.shiftDown);
        //             }
        //         }
        //         this.setState({
        //             mouseDown: false,
        //             mouseDownCoord: null,
        //             showHighlighter: false,
        //         });
        //     }
        // }
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
        // if (this.props.canvasRef == null ||
        //     this.props.mapSize == null ||
        //     this.props.buildingList == null ||
        //     this.props.buildingList.length === 0) {
        //     return null;
        // }

        // const result = [];

        // let minX = +TILE_W * (this.props.mapSize[0] * 2);
        // let minY = +TILE_H * (this.props.mapSize[1] * 2);
        // let maxX = -1, maxY = -1;
        // let hasInspectTargets = false;
        // const canvasBounds = this.props.canvasRef.getBoundingClientRect();

        // for (const key of Object.values(this.props.buildingList)) {
        //     if (this.props.cameraZ.toString() !== key.split(":")[0]) {
        //         continue;
        //     }

        //     const range = this.props.buildingBounds[key];

        //     const width = +TILE_W + (+TILE_W * Math.abs(range[1][0] - range[0][0]));
        //     const height = +TILE_H + (+TILE_H * Math.abs(range[1][1] - range[0][1]));

        //     const leftGrid = Math.min(range[1][0], range[0][0]) - this.props.camera[0];
        //     const topGrid = Math.min(range[1][1], range[0][1]) - this.props.camera[1];

        //     const left = canvasBounds.left + (+TILE_W * leftGrid);
        //     const top = canvasBounds.top + (+TILE_H * topGrid);

        //     const style = {
        //         width: `${width}px`,
        //         height: `${height}px`,
        //         left: `${left}px`,
        //         top: `${top}px`,
        //     };

        //     let thisClass = "building_inspect";

        //     if (this.props.inspectedBuildings != null) {
        //         for (let x = range[0][0]; x <= range[1][0]; x++) {
        //             for (let y = range[0][1]; y <= range[1][1]; y++) {
        //                 if (this.props.inspectedBuildings.some((m) => m === `${this.props.cameraZ}:${x}:${y}`)) {
        //                     thisClass += " inspecting";
        //                     minX = Math.min(minX, left);
        //                     minY = Math.min(minY, top);
        //                     maxX = Math.max(maxX, left + width);
        //                     maxY = Math.max(maxY, top + height);
        //                     hasInspectTargets = true;
        //                     x = range[1][0]; //break both loops
        //                     break;
        //                 }
        //             }
        //         }
        //     }

        //     const handleClick = (e: TouchEvent | MouseEvent) => {
        //         e.preventDefault();
        //         this.props.inspectTileAtMapCoord(range[0], this.state.shiftDown);
        //     };

        //     result.push((
        //         <a class={thisClass} title={range.display_name} onClick={handleClick} style={style}></a>
        //     ));
        // }

        // if (hasInspectTargets) {
        //     const width = maxX - minX;
        //     let allStyleLeft = minX;
        //     let allStyleTop = minY;
        //     if (this.state.toolbarMoveDragging) {
        //         allStyleLeft = +TILE_W + this.state.mouseX - ((this.state.mouseX - canvasBounds.left) % +TILE_W) - width;
        //         allStyleTop = +TILE_H + this.state.mouseY - ((this.state.mouseY - canvasBounds.top) % +TILE_H);
        //     }
        //     const allStyle = {
        //         width: `${width}px`,
        //         height: `${maxY - minY}px`,
        //         left: `${allStyleLeft}px`,
        //         top: `${allStyleTop}px`,
        //     };

        //     this.allInspectStartLeft = minX,
        //     this.allInspectStartTop = minY,
        //     this.allInspectLeft = allStyleLeft,
        //     this.allInspectTop = allStyleTop,

        //     result.push((
        //         <div class="all_inspect" style={allStyle}></div>
        //     ));
        // }

        // let toolbarStyle = {};
        // if (hasInspectTargets) {
        //     if (this.state.toolbarMoveDragging) {
        //         toolbarStyle = {
        //             left: `${maxX - +TILE_W - (this.state.dragStartX - this.state.mouseX)}px`,
        //             top: `${minY - (this.state.dragStartY - this.state.mouseY)}px`,
        //         };
        //     } else {
        //         toolbarStyle = {
        //             left: `${maxX - +TILE_W}px`,
        //             top: `${minY}px`,
        //         };
        //     }
        // } else {
        //     //render offscreen to get the image(s) to download
        //     toolbarStyle = {
        //         left: "-100vw",
        //         top: "-100vh",
        //     };
        // }

        // result.push((
        //     <div class="toolbar_wrapper" style={toolbarStyle}>
        //         <div class="inspect_toolbar">
        //             <div class="toolbar_move" onMouseDown={this.handleMoveMouseDown} onMouseUp={this.handleMoveMouseUp}>
        //                 <a class="drag_inner_target">
        //                     <i class="fas fa-arrows-alt"></i>
        //                 </a>
        //             </div>
        //         </div>
        //     </div>
        // ));

        // let wrapperClass = "inspect_wrapper";
        // if (this.props.inspecting) {
        //     wrapperClass += " inspecting";
        // }
        // if (this.state.mouseDown) {
        //     wrapperClass += " dragging";
        // }

        // return (
        //     <div class={wrapperClass}>
        //         {result}
        //     </div>
        // );
    }

    handleMoveMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        this.setState({
            toolbarMoveDragging: true,
            dragStartX: e.clientX,
            dragStartY: e.clientY,
            mouseX: e.clientX,
            mouseY: e.clientY,
        });
    }

    handleMoveMouseUp = (e: MouseEvent) => {
        // if (e.button !== 0) {
        //     return;
        // }
        // e.preventDefault();
        // this.props.inspectMoveSelectionRequest({
        //     diffX: this.allInspectLeft - this.allInspectStartLeft,
        //     diffY: this.allInspectTop - this.allInspectStartTop,
        // });
        // this.setState({
        //     toolbarMoveDragging: false,
        // });
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

export default connect(mapStateToProps, mapDispatchToProps)(GameHighlighter);
