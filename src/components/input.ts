import { BUILDINGS, DIRECTION, INPUT_STATE, KEYS, MENU, MENU_ID, Point } from "./constants";
import { decreasePlaceBuildHeight, decreasePlaceBuildWidth, increasePlaceBuildHeight, increasePlaceBuildWidth, placeCursorBuilding } from "./redux/building/actions";
import { setCameraZ, setGridBounds } from "./redux/camera/actions";
import { moveCursorDirection, moveCursorToGridPos } from "./redux/cursor/actions";
import { startDesignatingGrid, submitDesignating } from "./redux/digger/actions";
import { GameComponent } from "./redux/FlatReduxState";
import { setShiftDown } from "./redux/input/actions";
import { inspectGridPos, inspectMapPos, setInspectBuildings } from "./redux/inspect/actions";
import { selectMenu, selectPrevSubmenu } from "./redux/menu/actions";
import { toggleDebugMode } from "./redux/settings/actions";
import store from "./redux/store";
import { eventToPosition, getMapCoord } from "./util";

export class GameInput extends GameComponent {
    grid: HTMLElement;
    storeUpdated: () => any;

    constructor() {
        super();
        this.init();
    }

    dataLoaded = () => {
        this.grid = document.getElementById("grid");

        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("blur", this.handleBlur);

        this.grid.addEventListener("contextmenu", this.handleContextMenu);
        this.grid.addEventListener("mousedown", this.handleClick);
    }

    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        switch (this.inputState) {
            case INPUT_STATE.INSPECTING: {
                const [gridX, gridY] = eventToPosition(e, this.gridBounds);
                store.dispatch(inspectGridPos(gridX, gridY));
                break;
            }
            case INPUT_STATE.NEUTRAL: {
                const [gridX, gridY] = this.handleClick(e);
                if (this.currentSubmenu === MENU_ID.designate) {
                    store.dispatch(startDesignatingGrid(gridX, gridY));
                }
                break;
            }
            case INPUT_STATE.DESIGNATING: {
                this.handleClick(e);
                store.dispatch(submitDesignating());
                break;
            }
            case INPUT_STATE.PLACING_BUILDING: {
                const [gridX, gridY] = this.handleClick(e);
                const [mapX, mapY] = getMapCoord(gridX, gridY);
                store.dispatch(placeCursorBuilding(mapX, mapY));
                break;
            }
        }
    }

    /** @returns the GRID position of the click */
    handleClick = (e: MouseEvent | TouchEvent): Point => {
        e.preventDefault();
        const [gridX, gridY] = eventToPosition(e, this.gridBounds);
        if (gridX >= 0 && gridY >= 0) {
            store.dispatch(moveCursorToGridPos(gridX, gridY));
        }
        return [gridX, gridY];
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return;
        }
        //global hotkeys
        switch (e.keyCode) {
            case KEYS.VK_SHIFT:
                store.dispatch(setShiftDown(true));
                return;
            case KEYS.VK_BACK_QUOTE:
            case KEYS.VK_TILDE:
                e.preventDefault();
                store.dispatch(toggleDebugMode());
                return;
            case KEYS.VK_UP:
            case KEYS.VK_NUMPAD8:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.N, e.shiftKey));
                return;
            case KEYS.VK_PAGE_UP:
            case KEYS.VK_NUMPAD9:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.NE, e.shiftKey));
                return;
            case KEYS.VK_RIGHT:
            case KEYS.VK_NUMPAD6:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.E, e.shiftKey));
                return;
            case KEYS.VK_PAGE_DOWN:
            case KEYS.VK_NUMPAD3:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.SE, e.shiftKey));
                return;
            case KEYS.VK_DOWN:
            case KEYS.VK_NUMPAD2:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.S, e.shiftKey));
                return;
            case KEYS.VK_END:
            case KEYS.VK_NUMPAD1:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.SW, e.shiftKey));
                return;
            case KEYS.VK_LEFT:
            case KEYS.VK_NUMPAD4:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.W, e.shiftKey));
                return;
            case KEYS.VK_HOME:
            case KEYS.VK_NUMPAD7:
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.NW, e.shiftKey));
                return;
            case KEYS.VK_PERIOD:
            case KEYS.VK_GREATER_THAN:
                store.dispatch(setCameraZ(this.cameraZ - 1));
                return;
            case KEYS.VK_COMMA:
            case KEYS.VK_LESS_THAN:
                store.dispatch(setCameraZ(this.cameraZ + 1));
                return;
        }
        if (this.inputState !== INPUT_STATE.PLACING_BUILDING) {
            //menu navigation
            let key = "";
            if (this.currentSubmenu !== MENU_ID.top) {
                key = MENU.ITEMS[this.currentSubmenu].parsedKey + ":";
            }
            key += e.key;
            if (key in MENU.KEYS) {
                e.preventDefault();
                store.dispatch(selectMenu(MENU.KEYS[key].id));
                return;
            } else if (key in BUILDINGS.KEYS) {
                e.preventDefault();
                store.dispatch(selectMenu(BUILDINGS.KEYS[key].id));
                return;
            }
        }
        switch (this.inputState) {
            case INPUT_STATE.NEUTRAL: {
                switch (e.keyCode) {
                    case KEYS.VK_ESCAPE:
                        e.preventDefault();
                        store.dispatch(selectPrevSubmenu());
                        break;
                    case KEYS.VK_RETURN:
                        if (this.currentMenuItem != null && this.currentSubmenu === MENU_ID.designate) {
                            store.dispatch(startDesignatingGrid(this.cursorX, this.cursorY));
                        }
                        break;
                }
                break;
            }
            case INPUT_STATE.DESIGNATING: {
                switch (e.keyCode) {
                    case KEYS.VK_ESCAPE:
                        e.preventDefault();
                        store.dispatch(selectPrevSubmenu());
                        break;
                    case KEYS.VK_RETURN: {
                        store.dispatch(submitDesignating());
                        return;
                    }
                }
                break;
            }
            case INPUT_STATE.PLACING_BUILDING: {
                switch (e.keyCode) {
                    case KEYS.VK_ESCAPE:
                        e.preventDefault();
                        store.dispatch(selectPrevSubmenu());
                        break;
                    case KEYS.VK_RETURN: {
                        store.dispatch(placeCursorBuilding());
                        return;
                    }
                    case KEYS.VK_U: {
                        //+h
                        store.dispatch(increasePlaceBuildHeight());
                        return;
                    }
                    case KEYS.VK_M: {
                        //-h
                        store.dispatch(decreasePlaceBuildHeight());
                        return;
                    }
                    case KEYS.VK_K: {
                        //+w
                        store.dispatch(increasePlaceBuildWidth());
                        return;
                    }
                    case KEYS.VK_H: {
                        //-w
                        store.dispatch(decreasePlaceBuildWidth());
                        return;
                    }
                }
                break;
            }
            case INPUT_STATE.INSPECTING: {
                switch (e.keyCode) {
                    case KEYS.VK_ESCAPE:
                        e.preventDefault();
                        if (this.inspectedBuildings != null &&
                            this.inspectedBuildings.length > 0) {
                            store.dispatch(setInspectBuildings([]));
                        }
                        break;
                    case KEYS.VK_RETURN:
                        e.preventDefault();
                        store.dispatch(inspectMapPos(this.cursorX, this.cursorY));
                        break;
                }
                break;
            }
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        switch (e.keyCode) {
            case KEYS.VK_SHIFT:
                store.dispatch(setShiftDown(false));
                return;
        }
    }

    handleBlur = (e: Event) => {
        store.dispatch(setShiftDown(false));
    }

    handleResize = (e: Event) => {
        store.dispatch(setGridBounds(this.grid.getBoundingClientRect()));
    }
}
