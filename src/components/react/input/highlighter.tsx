import { h } from "preact";
import { INPUT_STATE, Point, TILE_H, TILE_W } from "../../constants";
import { useSelectors } from "../../redux";
import { isPointValid } from "../../util";
import { IInputState } from "./reducers/input";

export const Highlighter = (props: IInputState) => {
    const reduxState = useSelectors([
        "inputState",
        "gridBounds",
    ]);
    let highlighterStyle = {};
    if (!props.showHighlighter ||
        reduxState.inputState !== INPUT_STATE.INSPECTING ||
        !isPointValid(props.highlightingStartGridPos) ||
        !isPointValid(props.currentGridPos)) {
        // do not add styling
    } else {
        const width = TILE_W * (1 + Math.abs(props.currentGridPos[0] - props.highlightingStartGridPos[0]));
        const height = TILE_H * (1 + Math.abs(props.currentGridPos[1] - props.highlightingStartGridPos[1]));
        const left = reduxState.gridBounds.left + (TILE_W * Math.min(props.currentGridPos[0], props.highlightingStartGridPos[0]));
        const top = reduxState.gridBounds.top + (TILE_H * Math.min(props.currentGridPos[1], props.highlightingStartGridPos[1]));
        highlighterStyle = {
            width: `${width}px`,
            height: `${height}px`,
            left,
            top,
        };
    }

    return (
        <div id="highlighter"
            class={props.showHighlighter ? "active" : null}
            style={highlighterStyle}></div>
    );
};
