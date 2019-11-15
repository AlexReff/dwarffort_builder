import { Fragment, h } from "preact";
import { Ref, useEffect, useReducer, useRef } from "preact/hooks";
import {
    setShiftDown,
    useThunkDispatch,
} from "../../redux/";
import { Highlighter } from "./highlighter";
import { useTrackedRef } from "./hooks";
import { KeyboardInput } from "./keyboard";
import { MouseInput } from "./mouse";
import { initialState, reducer } from "./reducers/input";
import { InspectTiles } from "./tiles";

interface IInputProps {
    canvasRef: Ref<HTMLCanvasElement>;
}

export const Input = (props: IInputProps) => {
    const reduxDispatch = useThunkDispatch();
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const handleBlur = (e: Event) => {
            reduxDispatch(setShiftDown(false));
        };

        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    useEffect(() => {
        console.log("state.mouseDown", state.mouseDown);
    }, [state.mouseDown]);

    return (
        <Fragment>
            <MouseInput {...state} canvasElement={props.canvasRef} dispatch={dispatch} />
            <KeyboardInput />
            <Highlighter {...state} />
            <InspectTiles {...state} />
        </Fragment>
    );
};
