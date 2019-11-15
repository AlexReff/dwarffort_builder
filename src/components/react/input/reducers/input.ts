import { Point } from "../../../constants";
import { ExtractActionTypes, FlatReduxState } from "../../../redux";

export interface IInputState {
    mouseDown: boolean;
    showHighlighter: boolean;
    mouseDownPos: Point;
    highlightingStartGridPos: Point;
    mousePos: Point;
    currentGridPos: Point;
}

export const initialState: IInputState = {
    mouseDown: false,
    showHighlighter: false,
    mouseDownPos: null,
    highlightingStartGridPos: null,
    mousePos: null,
    currentGridPos: null,
};

const Actions = [
    {
        type: "mouseDown",
        pxPos: [0, 0] as Point,
        gridPos: [0, 0] as Point,
    },
    {
        type: "mouseMove",
        pxPos: [0, 0] as Point,
        gridPos: [0, 0] as Point,
    },
    {
        type: "mouseUp",
    },
] as const;

export type InputActions = ExtractActionTypes<typeof Actions>;

export const reducer = (state: IInputState, action: InputActions): IInputState => {
    switch (action.type) {
        case "mouseDown":
            console.log("mouseDown reducer processed");
            return {
                ...state,
                mouseDown: true,
                showHighlighter: false,
                mouseDownPos: action.pxPos,
                highlightingStartGridPos: action.gridPos,
            };
        case "mouseUp":
            console.log("mouseUp reducer processed");
            return {
                ...state,
                mouseDown: false,
                mouseDownPos: null,
                showHighlighter: false,
            };
        case "mouseMove":
            //show the highlighter if the mouse is held down and has moved at least 1 grid space
            const showHighlighter = state.showHighlighter ||
                (state.mouseDown &&
                    (state.highlightingStartGridPos[0] !== action.gridPos[0] ||
                        state.highlightingStartGridPos[1] !== action.gridPos[1]));
            return {
                ...state,
                currentGridPos: action.gridPos,
                mousePos: action.pxPos,
                showHighlighter,
            };
        default:
            throw new Error();
    }
};
