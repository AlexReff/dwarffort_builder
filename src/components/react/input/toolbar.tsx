import { Fragment, h } from "preact";
import { useCallback, useReducer } from "preact/hooks";
import { TILE_H, TILE_W } from "../../constants";
import { moveInspectedBuildings, useSelectors, useThunkDispatch } from "../../redux";
import { initialState, IToolbarProps, reducer } from "./reducers/toolbar";

export const Toolbar = (props: IToolbarProps) => {
    //draw box around all inspected buildings
    const reduxDispatch = useThunkDispatch();
    const [state, dispatch] = useReducer(reducer, initialState);
    const reduxState = useSelectors([
        "gridBounds",
    ]);
    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        dispatch({
            type: "mouseDown",
            dragStartPos: [e.clientX, e.clientY],
        });
    }, []);

    const allStyleWidth = props.maxX - props.minX;
    let allStyleLeft = props.minX;
    let allStyleTop = props.minY;
    if (state.toolbarMoveDragging) {
        allStyleLeft = TILE_W + props.mousePos[0] - ((props.mousePos[0] - reduxState.gridBounds.left) % TILE_W) - allStyleWidth;
        allStyleTop = TILE_H + props.mousePos[1] - ((props.mousePos[1] - reduxState.gridBounds.top) % TILE_H);
    }

    //render the toolbar offscreen to load the image
    const allStyle = props.hasInspectTargets ?
        {
            width: `${allStyleWidth}px`,
            height: `${props.maxY - props.minY}px`,
            left: `${allStyleLeft}px`,
            top: `${allStyleTop}px`,
        } : {
            left: "-1000vw",
            top: "-1000vh",
        };

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        reduxDispatch(moveInspectedBuildings(
            allStyleLeft - props.minX,
            allStyleTop - props.minY,
        ));
        dispatch({
            type: "mouseUp",
        });
    }, [allStyleLeft, allStyleTop]);

    let toolbarStyle = {};
    if (state.toolbarMoveDragging) {
        toolbarStyle = {
            left: `${props.maxX - TILE_W - (state.dragStartPos[0] - props.mousePos[0])}px`,
            top: `${props.minY - (state.dragStartPos[1] - props.mousePos[1])}px`,
        };
    } else {
        toolbarStyle = {
            left: `${props.maxX - TILE_W}px`,
            top: `${props.minY}px`,
        };
    }

    return (
        <Fragment>
            <div class="all_inspect" style={allStyle}></div>
            <div class="toolbar_wrapper" style={toolbarStyle}>
                <div class="inspect_toolbar">
                    <div class="toolbar_move" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                        <a class="drag_inner_target">
                            <i class="fas fa-arrows-alt"></i>
                        </a>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};
