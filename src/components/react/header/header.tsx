import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useSelectors } from "../../redux";

export const Header = () => {
    const [zLevelChanged, setZLevelChanged] = useState<boolean>(false);
    const reduxState = useSelectors([
        "cameraZ",
    ]);

    useEffect(() => {
        if (reduxState.cameraZ !== 0 && !zLevelChanged) {
            setZLevelChanged(true);
        }
    }, [reduxState.cameraZ]);

    return (
        <div class="header_info">
            {zLevelChanged ? (
                <div class="zlevel">
                    Z:{reduxState.cameraZ}
                </div>
            ) : null}
        </div>
    );
};
