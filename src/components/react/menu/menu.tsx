import { h } from "preact";
import { useSelector } from "react-redux";
import { handleMenuEvent } from ".";
import {
    BUILDINGS,
    IMenuItem,
    INPUT_STATE,
    MENU,
} from "../../constants";
import {
    useSelectors,
    useThunkDispatch,
} from "../../redux";
import { Breadcrumbs } from "./breadcrumbs";
import { Toolbar } from "./toolbar";

export const Menu = () => (
    <div id="menu">
        <Breadcrumbs />
        <MainMenu />
        <Toolbar />
        <div class="menu-bottom">
            <div class="menu-status">{/* {this.renderMenuStatus()} */}</div>
            {/* {this.renderCursorInfo()} */}
            <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
        </div>
    </div>
);

const MainMenu = () => {
    const dispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "buildingTiles",
        "cameraZ",
        "inputState",
        "currentMenuItem",
        "currentSubmenu",
    ]);

    if (reduxState.inputState === INPUT_STATE.PLACING_BUILDING) {
        return (<div></div>);
    }

    return (
        <div class="menu-items">
            {Object.keys(MENU.SUBMENUS).map((key) => (
                <div class={"submenu" + (reduxState.currentSubmenu === key ? " active" : "")}>
                    {key in BUILDINGS.SUBMENUS ?
                        BUILDINGS.SUBMENUS[key].map(
                            (bldg: IMenuItem) => (
                                <a onClick={(e) => handleMenuEvent(e, bldg.id, dispatch)}
                                    class={"menu-item" +
                                        (reduxState.currentMenuItem != null &&
                                            reduxState.currentMenuItem === bldg.id
                                            ? " active" : "")}
                                    title={bldg.text}
                                >
                                    {bldg.key}: {bldg.text}
                                </a>
                            ),
                        )
                        : null}
                    {MENU.SUBMENUS[key] != null && MENU.SUBMENUS[key].length > 0
                        ? MENU.SUBMENUS[key].map((item: IMenuItem) => {
                            if (item.text == null || item.text.length === 0) {
                                return;
                            }
                            return (
                                <a
                                    onClick={(e) => handleMenuEvent(e, item.id, dispatch)}
                                    class={"menu-item" +
                                        (reduxState.currentMenuItem != null &&
                                            reduxState.currentMenuItem === item.id
                                            ? " active" : "")}
                                    title={item.text}
                                >
                                    {item.key}: {item.text}
                                </a>
                            );
                        })
                        : null}
                </div>
            ))}
        </div>
    );
    /*
        switch (reduxState.inputState) {
            case INPUT_STATE.PLACING_BUILDING: {
                let placedZ = -1;
                let placedAll = -1;
                if (reduxState.cameraZ in reduxState.buildingTiles) {
                    placedZ = Object.keys(reduxState.buildingTiles[reduxState.cameraZ]).reduce(
                        (map, val) => map + (
                            reduxState.buildingTiles[reduxState.cameraZ][val].key === reduxState.currentMenuItem
                                ? 1 : 0), 0);
                    if (Object.keys(reduxState.buildingTiles).length > 1) {
                        //check how many buildings exist across all z-levels
                        placedAll = Object.keys(reduxState.buildingTiles).reduce(
                            (map, floor) =>
                                Object.keys(reduxState.buildingTiles[floor]).reduce(
                                    (thisFloor, pos) => thisFloor + (
                                        reduxState.buildingTiles[floor][pos].key === reduxState.currentMenuItem
                                            ? 1 : 0), 0), 0);
                    }
                }
                return (
                    <div class="menu-place">
                        <div>
                            Placing{" "}
                            {BUILDINGS.ITEMS[reduxState.currentMenuItem].text}
                        </div>
                        {placedZ > -1 ? (
                            <div>Placed (current Z): {placedZ}</div>
                        ) : null}
                        {placedAll > -1 ? (
                            <div>Placed (all floors): {placedAll}</div>
                        ) : null}
                    </div>
                );
            }
        }
    */
};
