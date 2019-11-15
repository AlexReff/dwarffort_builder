import { Fragment, h } from "preact";
import { useEffect } from "preact/hooks";
import { resizeWindow, useThunkDispatch } from "./redux";
import { debounce } from "./util";

interface IResizerProps {
    gridElement: any;
}

export const Resizer = (props: IResizerProps) => {
    const reduxDispatch = useThunkDispatch();

    useEffect(() => {
        const endWindowResizing = () => {
            reduxDispatch(resizeWindow(props.gridElement));
        };

        const handleWindowResize = debounce(endWindowResizing, 400, false);

        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, [props.gridElement]);

    return (
        <Fragment></Fragment>
    );
};
