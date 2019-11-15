import { Point } from "src/components/constants";
import { ExtractActionTypes } from "src/components/redux";

export interface IToolbarProps {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    mousePos: Point;
    hasInspectTargets: boolean;
}

export interface IToolbarState {
    toolbarMoveDragging: boolean;
    dragStartPos: Point;
}

export const initialState: IToolbarState = {
    toolbarMoveDragging: false,
    dragStartPos: null,
};

const Actions = [
    {
        type: "mouseDown",
        dragStartPos: [0, 0] as Point,
    },
    {
        type: "mouseUp",
    },
] as const;

export const reducer = (state: IToolbarState, action: ExtractActionTypes<typeof Actions>): IToolbarState => {
    switch (action.type) {
        case "mouseDown":
            return {
                ...state,
                toolbarMoveDragging: true,
                dragStartPos: action.dragStartPos,
            };
        case "mouseUp":
            return {
                ...state,
                toolbarMoveDragging: false,
            };
        default:
            throw new Error();
    }
};
