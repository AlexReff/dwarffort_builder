import { BUILDINGS, DIRECTION, KEYS, MENU, Point, TILE_H, TILE_W } from "./constants";
import { placeCursorBuilding } from "./redux/building/actions";
import { setCameraZ, setGridBounds } from "./redux/camera/actions";
import { moveCursorDirection, moveCursorToGridPos } from "./redux/cursor/actions";
import { startDesignatingGrid, submitDesignating } from "./redux/digger/actions";
import { GameComponent } from "./redux/FlatReduxState";
import { inspectGridPos, setInspectBuildings } from "./redux/inspect/actions";
import { selectMenu, selectPrevSubmenu } from "./redux/menu/actions";
import { toggleDebugMode } from "./redux/settings/actions";
import store from "./redux/store";
import { eventToPosition } from "./util";

export class GameInput extends GameComponent {
    // shiftDown: boolean;
    grid: HTMLElement;
    storeUpdated: () => any;

    constructor() {
        super();
        // this.shiftDown = false;
        this.init();
    }

    dataLoaded = () => {
        this.grid = document.getElementById("grid");

        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("resize", this.handleResize);

        this.grid.addEventListener("contextmenu", this.handleContextMenu);
        this.grid.addEventListener("mousedown", this.handleClick);
    }

    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (this.isInspecting) {
            const [gridX, gridY] = eventToPosition(e, this.gridBounds);
            store.dispatch(inspectGridPos(gridX, gridY));
        } else {
            const [gridX, gridY] = this.handleClick(e);
            this.handleEnter(gridX, gridY);
        }
    }

    handleEnter = (_gridX?, _gridY?) => {
        const gridX = _gridX || this.cursorX;
        const gridY = _gridY || this.cursorY;
        if (this.cursorBuilding) {
            store.dispatch(placeCursorBuilding());
        } else if (this.isDesignating) {
            store.dispatch(submitDesignating());
        } else {
            if (this.currentMenuItem != null && this.currentMenuItem in MENU.ITEMS) {
                if (MENU.ITEMS[this.currentMenuItem].parent === "designate") {
                    //if designation item selected
                    store.dispatch(startDesignatingGrid(gridX, gridY));
                }
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
        if (e.keyCode === KEYS.VK_SHIFT) {
            // e.preventDefault();
            // this.shiftDown = true;
            return;
        }
        //menu navigation
        let key = "";
        if (this.currentSubmenu !== "top") {
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
        //end menu navigation
        switch (e.keyCode) {
            case KEYS.VK_BACK_QUOTE:
            case KEYS.VK_TILDE:
                e.preventDefault();
                store.dispatch(toggleDebugMode());
                break;
            case KEYS.VK_ESCAPE:
                e.preventDefault();
                if (this.isInspecting &&
                    this.inspectedBuildings != null &&
                    this.inspectedBuildings.length > 0) {
                    store.dispatch(setInspectBuildings([]));
                } else {
                    store.dispatch(selectPrevSubmenu());
                }
                break;
            case KEYS.VK_RETURN:
            case KEYS.VK_ENTER:
                e.preventDefault();
                this.handleEnter();
                break;
            case KEYS.VK_UP:
            case KEYS.VK_NUMPAD8:
                //move north
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.N, e.shiftKey));
                break;
            case KEYS.VK_PAGE_UP:
            case KEYS.VK_NUMPAD9:
                //move ne
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.NE, e.shiftKey));
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_NUMPAD6:
                //move east
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.E, e.shiftKey));
                break;
            case KEYS.VK_PAGE_DOWN:
            case KEYS.VK_NUMPAD3:
                //move se
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.SE, e.shiftKey));
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_NUMPAD2:
                //move south
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.S, e.shiftKey));
                break;
            case KEYS.VK_END:
            case KEYS.VK_NUMPAD1:
                //move sw
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.SW, e.shiftKey));
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_NUMPAD4:
                //move west
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.W, e.shiftKey));
                break;
            case KEYS.VK_HOME:
            case KEYS.VK_NUMPAD7:
                //move nw
                e.preventDefault();
                store.dispatch(moveCursorDirection(DIRECTION.NW, e.shiftKey));
                break;
            case KEYS.VK_PERIOD:
            case KEYS.VK_GREATER_THAN:
                store.dispatch(setCameraZ(this.cameraZ - 1));
                break;
            case KEYS.VK_COMMA:
            case KEYS.VK_LESS_THAN:
                store.dispatch(setCameraZ(this.cameraZ + 1));
                break;
            default:
                break;
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        // if (e.keyCode === KEYS.VK_SHIFT) {
        //     this.shiftDown = false;
        // }
    }

    handleResize = (e: Event) => {
        // this.gridBounds = this.grid.getBoundingClientRect();
        store.dispatch(setGridBounds(this.grid.getBoundingClientRect()));
    }
}
