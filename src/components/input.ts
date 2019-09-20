import { BUILDINGS, DIRECTION, KEYS, MENU, TILE_H, TILE_W } from "./constants";
import { setCameraZ } from "./redux/camera/actions";
import { moveCursorDirection, moveCursorToGridPos } from "./redux/cursor/actions";
import { GameComponent } from "./redux/FlatReduxState";
import { selectMenu, selectPrevSubmenu } from "./redux/menu/actions";
import store from "./redux/store";

export class GameInput extends GameComponent {
    shiftDown: boolean;
    grid: HTMLElement;
    gridBounds: ReturnType<HTMLElement["getBoundingClientRect"]>;
    storeUpdated: () => any;

    constructor() {
        super();
        this.shiftDown = false;
        this.init();
    }

    dataLoaded = () => {
        this.grid = document.getElementById("grid");
        this.gridBounds = this.grid.getBoundingClientRect();

        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("resize", this.handleResize);
        this.grid.addEventListener("contextmenu", this.handleContextMenu);
        this.grid.addEventListener("mousedown", this.handleClick);
    }

    handleContextMenu = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (this.isInspecting) {
            //
        } else {
            // const gridPos = this.display.eventToPosition(e);
            // const mapPos = this.getMapCoord(gridPos);
            // this.cursorPosition = mapPos.slice() as Point;
            // this.moveCursorTo(mapPos);
            // this.handleEnterRightClick();
        }
    }

    handleClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        let x, y;
        if ("touches" in e) {
            x = e.touches[0].clientX;
            y = e.touches[1].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        //single left click -> move cursor to position
        const [gridX, gridY] = this.eventToPosition(x, y);
        if (gridX >= 0 && gridY >= 0) {
            store.dispatch(moveCursorToGridPos(gridX, gridY));
        }
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.getModifierState("Control")) {
            return;
        }
        if (e.keyCode === KEYS.VK_SHIFT) {
            e.preventDefault();
            this.shiftDown = true;
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
                // this.setState((prevState) => ({
                //     debug: !prevState.debug,
                // }));
                break;
            case KEYS.VK_ESCAPE:
                e.preventDefault();
                store.dispatch(selectPrevSubmenu());
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
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.shiftDown = false;
        }
    }

    handleResize = (e: Event) => {
        this.gridBounds = this.grid.getBoundingClientRect();
    }

    eventToPosition(x: number, y: number): [number, number] {
        const rect = this.gridBounds;
        x -= rect.left;
        y -= rect.top;

        x *= rect.width / rect.width;
        y *= rect.height / rect.height;

        if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) { return [-1, -1]; }

        return this._normalizedEventToPosition(x, y);
    }

    _normalizedEventToPosition(x: number, y: number): [number, number] {
        return [Math.floor(x / TILE_W), Math.floor(y / TILE_H)];
    }
}
