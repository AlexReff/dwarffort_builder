import { Fragment, h } from "preact";
import { useEffect } from "preact/hooks";
import { toggleAnimation, useThunkDispatch } from "./redux";

export const Animator = () => {
    const dispatch = useThunkDispatch();

    useEffect(() => {
        const toggleAnim = () => {
            dispatch(toggleAnimation());
        };

        const timer = window.setInterval(toggleAnim, 333);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return (
        <Fragment></Fragment>
    );
};
