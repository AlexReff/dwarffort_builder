import { connect } from "react-redux";
import { Point } from "../../constants";
import {
    clearHighlightBuildings,
    highlightBuildings,
    IBuildingState,
    ICameraState,
    IInputState,
    IInspectState,
    inspectAllOfTypeAtGridPos,
    inspectGridPos,
    inspectGridRange,
    mapDispatchToProps,
    mapStateToProps,
    moveInspectedBuildings,
} from "../../redux";
import { Highlighter } from "./component";

export interface IHighlighterState {
    highlightingStart: Point; //grid Position
    currentPosition: Point; //grid Position
    mouseDown: boolean;
    mouseDownCoord: Point;
    showHighlighter: boolean;
    toolbarMoveDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    mouseX: number;
    mouseY: number;
}

class HighlighterReduxProps {
    constructor(
        public cameraX: ICameraState["cameraX"] = null,
        public cameraY: ICameraState["cameraY"] = null,
        public cameraZ: ICameraState["cameraZ"] = null,
        public mapHeight: ICameraState["mapHeight"] = null,
        public mapWidth: ICameraState["mapWidth"] = null,
        public gridBounds: ICameraState["gridBounds"] = null,
        public inputState: IInputState["inputState"] = null,
        public inspectedBuildings: IInspectState["inspectedBuildings"] = null,
        public highlightedBuildings: IInspectState["highlightedBuildings"] = null,
        public buildingPositions: IBuildingState["buildingPositions"] = null,
        public buildingTiles: IBuildingState["buildingTiles"] = null,
    ) { }
}

const HighlighterFuncs = {
    inspectGridPos,
    moveInspectedBuildings,
    inspectGridRange,
    inspectAllOfTypeAtGridPos,
    highlightBuildings,
    clearHighlightBuildings,
};

export type IHighlighterProps = HighlighterReduxProps & typeof HighlighterFuncs;

const reduxProps = mapStateToProps(Object.keys(new HighlighterReduxProps()));

const reduxFuncs = mapDispatchToProps(Object.values(HighlighterFuncs));

export default connect(reduxProps, reduxFuncs)(Highlighter);
