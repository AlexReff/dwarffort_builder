import { Component, h } from "preact";
import { IHighlighterProps, IHighlighterState } from ".";
import { BUILDINGS, IBuildingTile, IMenuItem, INPUT_STATE, Point, TILE_H, TILE_W } from "../../constants";
import { eventToPosition } from "../../util";

export class Highlighter extends Component<IHighlighterProps, IHighlighterState> {
    allInspectStartLeft: number;
    allInspectStartTop: number;
    allInspectLeft: number;
    allInspectTop: number;
    canvasElement: HTMLElement;

    constructor() {
        super();
        this.setState({
            currentPosition: null,
            highlightingStart: null,
            showHighlighter: false,
            mouseDown: false,
            toolbarMoveDragging: false,
        });
    }

    componentDidMount = () => {
        this.canvasElement = document.getElementById("canvas");
        this.canvasElement.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    //#region handlers
    handleMouseDown = (e: MouseEvent | TouchEvent) => {
        const targ: any = "touches" in e ? e.touches : e;
        const [gridX, gridY] = eventToPosition(e, this.props.gridBounds);
        const highlightingStart: Point = [gridX, gridY];
        this.setState({
            mouseDown: true,
            mouseDownCoord: [targ.clientX, targ.clientY],
            showHighlighter: false,
            highlightingStart,
        });
    }

    handleMouseUp = (e: MouseEvent | TouchEvent) => {
        if (this.props.inputState === INPUT_STATE.INSPECTING) {
            if (this.state.showHighlighter) {
                e.preventDefault();
                this.props.inspectGridRange(this.state.highlightingStart, this.state.currentPosition);
            }
        }
        this.setState({
            mouseDown: false,
            mouseDownCoord: null,
            showHighlighter: false,
        });
    }

    handleMouseMove = (e: MouseEvent | TouchEvent) => {
        const [gridX, gridY] = eventToPosition(e, this.props.gridBounds);
        const targ = "touches" in e ? e.touches[0] : e;
        const currentPosition: Point = [gridX, gridY];
        this.setState((prevState: IHighlighterState) => ({
            showHighlighter: prevState.showHighlighter ? true : prevState.mouseDown && (prevState.highlightingStart[0] !== gridX || prevState.highlightingStart[1] !== gridY),
            currentPosition,
            mouseX: targ.clientX,
            mouseY: targ.clientY,
        }));
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
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        this.props.moveInspectedBuildings(this.allInspectLeft - this.allInspectStartLeft, this.allInspectTop - this.allInspectStartTop);
        this.setState({
            toolbarMoveDragging: false,
        });
    }

    handleBuildingClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const [gridX, gridY] = eventToPosition(e, this.props.gridBounds);
        this.props.inspectGridPos(gridX, gridY);
    }

    handleBuildingDoubleClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const [gridX, gridY] = eventToPosition(e, this.props.gridBounds);
        this.props.inspectAllOfTypeAtGridPos(gridX, gridY);
    }

    handleInspectHoverEnter = (e: MouseEvent | TouchEvent, targets: string[]) => {
        e.preventDefault();
        this.props.highlightBuildings(targets);
    }

    handleInspectHoverLeave = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        this.props.clearHighlightBuildings();
    }

    //#endregion handlers

    getHighlighterStyle = () => {
        if (this.props.inputState !== INPUT_STATE.INSPECTING ||
            !this.state.showHighlighter ||
            this.state.highlightingStart == null ||
            this.state.highlightingStart.length !== 2 ||
            this.state.highlightingStart[0] < 0 ||
            this.state.highlightingStart[1] < 0 ||
            this.state.currentPosition == null ||
            this.state.currentPosition.length !== 2 ||
            this.state.currentPosition[0] < 0 ||
            this.state.currentPosition[1] < 0) {
            return {};
        }
        const width = +TILE_W * (1 + Math.abs(this.state.currentPosition[0] - this.state.highlightingStart[0]));
        const height = +TILE_H * (1 + Math.abs(this.state.currentPosition[1] - this.state.highlightingStart[1]));
        const left = this.props.gridBounds.left + (+TILE_W * Math.min(this.state.currentPosition[0], this.state.highlightingStart[0]));
        const top = this.props.gridBounds.top + (+TILE_H * Math.min(this.state.currentPosition[1], this.state.highlightingStart[1]));
        return {
            width: `${width}px`,
            height: `${height}px`,
            left,
            top,
        };
    }

    getInspectTiles = () => {
        const result = [];

        //bounds for the box around all inspected buildings
        let minX = +TILE_W * (this.props.mapWidth * 2);
        let minY = +TILE_H * (this.props.mapHeight * 2);
        let maxX = -1, maxY = -1;

        let hasInspectTargets = false;

        if (this.props.cameraZ in this.props.buildingTiles) {
            //draw a box around each building
            for (const key of Object.keys(this.props.buildingTiles[this.props.cameraZ])) {
                const tile: IBuildingTile = this.props.buildingTiles[this.props.cameraZ][key];
                const bldg: IMenuItem = BUILDINGS.ITEMS[tile.key];

                const radi = Math.floor(bldg.tiles.length / 2.0);

                const startLeft = tile.posX - radi;
                const startTop = tile.posY - radi;
                const endLeft = tile.posX + radi;
                const endTop = tile.posY + radi;

                const width = +TILE_W * (endLeft - startLeft + 1);
                const height = +TILE_H * (endTop - startTop + 1);

                const leftGrid = startLeft - this.props.cameraX;
                const topGrid = startTop - this.props.cameraY;

                const left = this.props.gridBounds.left + (+TILE_W * leftGrid);
                const top = this.props.gridBounds.top + (+TILE_H * topGrid);

                const style = {
                    width: `${width}px`,
                    height: `${height}px`,
                    left: `${left}px`,
                    top: `${top}px`,
                };

                const posKey = `${tile.posX}:${tile.posY}`;
                const thisInspected = this.props.inspectedBuildings.some((m) => m === posKey);
                if (thisInspected) {
                    hasInspectTargets = true;
                    minX = Math.min(minX, left);
                    minY = Math.min(minY, top);
                    maxX = Math.max(maxX, left + width);
                    maxY = Math.max(maxY, top + height);
                }
                const thisClass = "building_inspect"
                    + (thisInspected ? " inspecting" : "")
                    + (this.props.highlightedBuildings.some((m) => m === posKey) ? " highlighted" : "");

                result.push((
                    <a class={thisClass} title={bldg.text} onClick={this.handleBuildingClick} onDblClick={this.handleBuildingDoubleClick} style={style}></a>
                ));
            }
        }

        if (hasInspectTargets) {
            //draw box around all inspected buildings
            const allStyleWidth = maxX - minX;
            let allStyleLeft = minX;
            let allStyleTop = minY;
            if (this.state.toolbarMoveDragging) {
                allStyleLeft = +TILE_W + this.state.mouseX - ((this.state.mouseX - this.props.gridBounds.left) % +TILE_W) - allStyleWidth;
                allStyleTop = +TILE_H + this.state.mouseY - ((this.state.mouseY - this.props.gridBounds.top) % +TILE_H);
            }
            const allStyle = {
                width: `${allStyleWidth}px`,
                height: `${maxY - minY}px`,
                left: `${allStyleLeft}px`,
                top: `${allStyleTop}px`,
            };

            this.allInspectStartLeft = minX,
                this.allInspectStartTop = minY,
                this.allInspectLeft = allStyleLeft,
                this.allInspectTop = allStyleTop,

                result.push((
                    <div class="all_inspect" style={allStyle}></div>
                ));
        }

        let toolbarStyle = {};
        if (hasInspectTargets) {
            //draw the toolbar above the 'all inspected buildings' box
            if (this.state.toolbarMoveDragging) {
                toolbarStyle = {
                    left: `${maxX - +TILE_W - (this.state.dragStartX - this.state.mouseX)}px`,
                    top: `${minY - (this.state.dragStartY - this.state.mouseY)}px`,
                };
            } else {
                toolbarStyle = {
                    left: `${maxX - +TILE_W}px`,
                    top: `${minY}px`,
                };
            }
        } else {
            //render offscreen to get the image(s) to download
            toolbarStyle = {
                left: "-100vw",
                top: "-100vh",
            };
        }

        result.push((
            <div class="toolbar_wrapper" style={toolbarStyle}>
                <div class="inspect_toolbar">
                    <div class="toolbar_move" onMouseDown={this.handleMoveMouseDown} onMouseUp={this.handleMoveMouseUp}>
                        <a class="drag_inner_target">
                            <i class="fas fa-arrows-alt"></i>
                        </a>
                    </div>
                </div>
            </div>
        ));

        let wrapperClass = "inspect_wrapper";
        if (this.props.inputState === INPUT_STATE.INSPECTING) {
            wrapperClass += " inspecting";
        }
        if (this.state.mouseDown) {
            wrapperClass += " dragging"; //disables pointer events
        }

        return (
            <div class={wrapperClass}>
                {result}
            </div>
        );
    }

    render = (props: IHighlighterProps, state: IHighlighterState) => {
        let stack = [];
        stack.push((
            <div id="highlighter" class={state.showHighlighter ? "active" : null} style={this.getHighlighterStyle()}></div>
        ));

        stack = stack.concat(this.getInspectTiles());

        return stack;
    }
}
