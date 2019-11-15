import { Fragment, h } from "preact";
import { Ref, useCallback, useEffect, useRef } from "preact/hooks";
import { INPUT_STATE, MENU_ID, Point } from "../../constants";
import {
    inspectGridPos,
    inspectGridRange,
    moveCursorToGridPos,
    placeCursorBuilding,
    startDesignatingGrid,
    submitDesignating,
    useSelectors,
    useThunkDispatch,
} from "../../redux/";
import { eventToPosition, getMapCoord } from "../../util";
import { useTrackedRef } from "./hooks";
import { IInputState, InputActions } from "./reducers/input";

interface IMouseInputProps {
    dispatch: (action: InputActions) => void;
    canvasElement: Ref<HTMLElement>;
}

export const MouseInput = (props: IInputState & IMouseInputProps) => {
    const reduxDispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "gridBounds",
        "inputState",
        "currentSubmenu",
        "currentMenuItem",
    ]);

    const gridBounds = useTrackedRef(reduxState.gridBounds);
    const inputState = useTrackedRef(reduxState.inputState);
    const currentSubmenu = useTrackedRef(reduxState.currentSubmenu);
    const currentMenuItem = useTrackedRef(reduxState.currentMenuItem);

    const handleMouseDown = useCallback((e: MouseEvent | TouchEvent, skipDispatch: boolean = false) => {
        const targ: any = "touches" in e ? e.touches[0] : e;
        const gridPos = eventToPosition(e, gridBounds.current);
        if (skipDispatch) {
            //if called in another fucntion that will 
            props.dispatch({
                type: "mouseDown",
                gridPos,
                pxPos: [targ.clientX, targ.clientY],
            });
        }
        if (gridPos[0] >= 0 && gridPos[1] >= 0) {
            reduxDispatch(moveCursorToGridPos(gridPos[0], gridPos[1]));
        }
        return [gridPos[0], gridPos[1]];
    }, [props.dispatch]);

    //mousedown
    useEffect(() => {
        if (props.canvasElement.current === null) {
            return;
        }
        const thisEl = props.canvasElement.current;
        thisEl.addEventListener("mousedown", handleMouseDown);

        return () => {
            thisEl.removeEventListener("mousedown", handleMouseDown);
        };
    }, [
        props.canvasElement.current,
        props.dispatch,
        handleMouseDown,
    ]);

    //contextmenu
    useEffect(() => {
        if (props.canvasElement.current == null) {
            return;
        }

        const handleContextMenu = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            console.log("mouseUp dispatched");
            props.dispatch({
                type: "mouseUp",
            });
            switch (inputState.current) {
                case INPUT_STATE.INSPECTING: {
                    const [gridX, gridY] = eventToPosition(e, gridBounds.current);
                    reduxDispatch(inspectGridPos(gridX, gridY));
                    break;
                }
                case INPUT_STATE.NEUTRAL: {
                    const [gridX, gridY] = handleMouseDown(e);
                    if (currentSubmenu.current === MENU_ID.designate &&
                        currentMenuItem.current != null &&
                        currentMenuItem.current.length > 0) {
                        reduxDispatch(startDesignatingGrid(gridX, gridY));
                    }
                    break;
                }
                case INPUT_STATE.DESIGNATING: {
                    handleMouseDown(e);
                    reduxDispatch(submitDesignating());
                    break;
                }
                case INPUT_STATE.PLACING_BUILDING: {
                    const [gridX, gridY] = handleMouseDown(e);
                    const [mapX, mapY] = getMapCoord(gridX, gridY);
                    reduxDispatch(placeCursorBuilding(mapX, mapY));
                    break;
                }
            }
        };

        const thisEl = props.canvasElement.current;
        thisEl.addEventListener("contextmenu", handleContextMenu);

        return () => {
            thisEl.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [
        props.canvasElement.current,
        props.dispatch,
        handleMouseDown,
    ]);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (gridBounds.current == null) {
            return;
        }
        const targ = "touches" in e ? e.touches[0] : e;
        const gridPos = eventToPosition(e, gridBounds.current);
        props.dispatch({
            type: "mouseMove",
            gridPos,
            pxPos: [targ.clientX, targ.clientY],
        });
    }, [
        props.dispatch,
    ]);

    //mouseMove
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleMouseMove]);

    //mouseUp
    useEffect(() => {
        const handleMouseUp = (e: MouseEvent | TouchEvent) => {
            if (inputState.current === INPUT_STATE.INSPECTING) {
                if (props.showHighlighter) {
                    e.preventDefault();
                    reduxDispatch(inspectGridRange(props.highlightingStartGridPos, props.currentGridPos));
                }
            }
            console.log("mouseUp dispatched");
            props.dispatch({
                type: "mouseUp",
            });
        };

        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        props.showHighlighter,
        props.highlightingStartGridPos,
        props.currentGridPos,
        props.dispatch,
    ]);

    return (
        <Fragment></Fragment>
    );
};
