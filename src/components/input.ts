import { BUILDINGS, DIRECTION, KEYS, MENU } from "./constants";
import { setCameraZ } from "./redux/camera/actions";
import { moveCursorDirection } from "./redux/cursor/actions";
import { GameComponent } from "./redux/FlatReduxState";
import { selectMenu, selectPrevSubmenu } from "./redux/menu/actions";
import store from "./redux/store";

export class GameInput extends GameComponent {
    shiftDown: boolean;
    storeUpdated: () => any;

    constructor() {
        super();
        this.shiftDown = false;
        this.init();
    }

    dataLoaded = () => {
        window.addEventListener("keydown", this.handleKeyPress);
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
}
