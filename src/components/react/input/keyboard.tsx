import { Fragment, h } from "preact";
import { useEffect } from "preact/hooks";
import { BUILDINGS, DIRECTION, INPUT_STATE, KEYS, MENU, MENU_ID } from "../../constants";
import {
    decreasePlaceBuildHeight,
    decreasePlaceBuildWidth,
    increasePlaceBuildHeight,
    increasePlaceBuildWidth,
    inspectMapPos,
    moveCursorDirection,
    placeCursorBuilding,
    selectMenu,
    selectPrevSubmenu,
    setCameraZ,
    setDesignateStart,
    setInspectBuildings,
    setShiftDown,
    submitDesignating,
    useSelectors,
    useThunkDispatch,
} from "../../redux/";
import { useTrackedRef } from "./hooks";

export const KeyboardInput = () => {
    const reduxDispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "inputState",
        "cameraZ",
        "cursorX",
        "cursorY",
        "currentSubmenu",
        "currentMenuItem",
        "inspectedBuildings",
    ]);

    //handleKeyUp
    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case KEYS.VK_SHIFT:
                    reduxDispatch(setShiftDown(false));
                    return;
            }
        };

        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const inputState = useTrackedRef(reduxState.inputState);
    const cameraZ = useTrackedRef(reduxState.cameraZ);
    const cursorX = useTrackedRef(reduxState.cursorX);
    const cursorY = useTrackedRef(reduxState.cursorY);
    const inspectedBuildings = useTrackedRef(reduxState.inspectedBuildings);
    const currentSubmenu = useTrackedRef(reduxState.currentSubmenu);
    const currentMenuItem = useTrackedRef(reduxState.currentMenuItem);

    //handleKeyPress
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.getModifierState("Control")) {
                return;
            }
            //global hotkeys
            switch (e.keyCode) {
                case KEYS.VK_SHIFT:
                    reduxDispatch(setShiftDown(true));
                    return;
                case KEYS.VK_BACK_QUOTE:
                case KEYS.VK_TILDE:
                    e.preventDefault();
                    // reduxDispatch(toggleDebugMode());
                    return;
                case KEYS.VK_UP:
                case KEYS.VK_NUMPAD8:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.N, e.shiftKey));
                    return;
                case KEYS.VK_PAGE_UP:
                case KEYS.VK_NUMPAD9:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.NE, e.shiftKey));
                    return;
                case KEYS.VK_RIGHT:
                case KEYS.VK_NUMPAD6:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.E, e.shiftKey));
                    return;
                case KEYS.VK_PAGE_DOWN:
                case KEYS.VK_NUMPAD3:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.SE, e.shiftKey));
                    return;
                case KEYS.VK_DOWN:
                case KEYS.VK_NUMPAD2:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.S, e.shiftKey));
                    return;
                case KEYS.VK_END:
                case KEYS.VK_NUMPAD1:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.SW, e.shiftKey));
                    return;
                case KEYS.VK_LEFT:
                case KEYS.VK_NUMPAD4:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.W, e.shiftKey));
                    return;
                case KEYS.VK_HOME:
                case KEYS.VK_NUMPAD7:
                    e.preventDefault();
                    reduxDispatch(moveCursorDirection(DIRECTION.NW, e.shiftKey));
                    return;
                case KEYS.VK_PERIOD:
                case KEYS.VK_GREATER_THAN:
                    reduxDispatch(setCameraZ(cameraZ.current - 1));
                    return;
                case KEYS.VK_COMMA:
                case KEYS.VK_LESS_THAN:
                    reduxDispatch(setCameraZ(cameraZ.current + 1));
                    return;
            }
            if (inputState.current !== INPUT_STATE.PLACING_BUILDING) {
                //menu navigation
                let key = "";
                if (currentSubmenu.current !== MENU_ID.top) {
                    key = MENU.ITEMS[currentSubmenu.current].parsedKey + ":";
                }
                key += e.key;
                if (key in MENU.KEYS) {
                    e.preventDefault();
                    reduxDispatch(selectMenu(MENU.KEYS[key].id));
                    return;
                } else if (key in BUILDINGS.KEYS) {
                    e.preventDefault();
                    reduxDispatch(selectMenu(BUILDINGS.KEYS[key].id));
                    return;
                }
            }
            switch (inputState.current) {
                case INPUT_STATE.NEUTRAL: {
                    switch (e.keyCode) {
                        case KEYS.VK_ESCAPE:
                            e.preventDefault();
                            reduxDispatch(selectPrevSubmenu());
                            break;
                        case KEYS.VK_RETURN:
                            if (currentMenuItem.current != null && currentSubmenu.current === MENU_ID.designate) {
                                reduxDispatch(setDesignateStart(cursorX.current, cursorY.current, cameraZ.current));
                            }
                            break;
                    }
                    break;
                }
                case INPUT_STATE.DESIGNATING: {
                    switch (e.keyCode) {
                        case KEYS.VK_ESCAPE:
                            e.preventDefault();
                            reduxDispatch(selectPrevSubmenu());
                            break;
                        case KEYS.VK_RETURN: {
                            reduxDispatch(submitDesignating());
                            return;
                        }
                    }
                    break;
                }
                case INPUT_STATE.PLACING_BUILDING: {
                    switch (e.keyCode) {
                        case KEYS.VK_ESCAPE:
                            e.preventDefault();
                            reduxDispatch(selectPrevSubmenu());
                            break;
                        case KEYS.VK_RETURN: {
                            reduxDispatch(placeCursorBuilding());
                            return;
                        }
                        case KEYS.VK_U: {
                            //+h
                            reduxDispatch(increasePlaceBuildHeight());
                            return;
                        }
                        case KEYS.VK_M: {
                            //-h
                            reduxDispatch(decreasePlaceBuildHeight());
                            return;
                        }
                        case KEYS.VK_K: {
                            //+w
                            reduxDispatch(increasePlaceBuildWidth());
                            return;
                        }
                        case KEYS.VK_H: {
                            //-w
                            reduxDispatch(decreasePlaceBuildWidth());
                            return;
                        }
                    }
                    break;
                }
                case INPUT_STATE.INSPECTING: {
                    switch (e.keyCode) {
                        case KEYS.VK_ESCAPE:
                            e.preventDefault();
                            if (inspectedBuildings.current != null &&
                                inspectedBuildings.current.length > 0) {
                                reduxDispatch(setInspectBuildings([]));
                            } else {
                                reduxDispatch(selectPrevSubmenu());
                            }
                            break;
                        case KEYS.VK_RETURN:
                            e.preventDefault();
                            reduxDispatch(inspectMapPos(cursorX.current, cursorY.current));
                            break;
                    }
                    break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    return (
        <Fragment></Fragment>
    );
};
