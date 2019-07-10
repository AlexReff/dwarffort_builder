import * as _ from "lodash";
import { Component, h } from "preact";
import { items as MENU_ITEMS } from "./data/menu.json";

interface IMenuItem {
    "text": string;
    "key": string;
    "id": string;
    "children"?: IMenuItem[];
    "parent"?: IMenuItem;
}

interface IMenuProps {
    initialMenu: string;

    /**
     * Handles the event by 'id'
     *
     * @returns true if event was handled, false if no handling occured
     */
    handleMenuEvent: (e: string) => boolean;
}

interface IMenuState {
    selectedMenu: string;
}

class Menu extends Component<IMenuProps, IMenuState> {
    private MENU_PARSED: Map<string, IMenuItem>;

    constructor(props: IMenuProps) {
        super();

        this.MENU_PARSED = new Map();
        this.parseMenuItemRecursive(MENU_ITEMS);

        this.setState({
            selectedMenu: props.initialMenu,
        });
    }

    parseMenuItemRecursive = (items: IMenuItem[], parent?: IMenuItem) => {
        for (const item of items) {
            const copy = item;
            copy.parent = parent;
            this.MENU_PARSED[(parent != null ? parent.key + ":" : "") + copy.key] = copy;
            if (copy.children != null && copy.children.length) {
                this.parseMenuItemRecursive(copy.children, copy);
            }
        }
    }

    getActiveMenuItem(state?: IMenuState): IMenuItem {
        state = state || this.state;
        return this.MENU_PARSED[state.selectedMenu];
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyPressHandler, true);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyPressHandler, true);
    }

    keyPressHandler = (ev: KeyboardEvent) => {
        const _this = this;

        switch (ev.key) {
            case "Escape":
            case "Esc":
            case "escape":
            case "esc":
                ev.preventDefault();
                if (!_this.props.handleMenuEvent("escape")) {
                    const idx = _this.state.selectedMenu.lastIndexOf(":");
                    if (idx > 0) {
                        _this.setState({
                            selectedMenu: _this.state.selectedMenu.substr(0, idx),
                        });
                    } else {
                        _this.setState({
                            selectedMenu: "top",
                        });
                    }
                }
                break;
            default:
                const key = _this.state.selectedMenu !== "top" ? _this.state.selectedMenu + ":" + ev.key : ev.key;
                const hotkeyTarget = _this.MENU_PARSED[key];
                if (hotkeyTarget) {
                    ev.preventDefault();
                    //if the menu item represents a sub-menu, change the active menu
                    if (_this.MENU_PARSED[key] != null &&
                        _this.MENU_PARSED[key].children != null &&
                        _this.MENU_PARSED[key].children.length > 0) {
                        //
                        _this.setState({
                            selectedMenu: key,
                        });
                        // _this.props.handleMenuEvent("Escape");
                        break;
                    }

                    //otherwise, bubble up the event
                    _this.props.handleMenuEvent(_this.MENU_PARSED[key].id);
                }
                break;
        }
    }

    //render each individual menu with separate keys
    getChildMenu(items: IMenuItem[], activeMenu: string, group: string, prefix?: string) {
        if (typeof items === "undefined" ||
            items === null ||
            items.length === 0) {
            return;
        }

        const stack = [];
        const childStack = [];

        if (prefix == null || prefix.length === 0) {
            prefix = "";
        } else {
            prefix += ":";
        }

        for (const i of items) {
            stack.push((
                <div id={i.key}>{i.key}: {i.text}</div>
            ));
            if (i.children != null && i.children.length > 0) {
                childStack.push(this.getChildMenu(i.children, activeMenu, prefix + i.key, prefix + i.key));
            }
        }

        const thisMenu: any[] = [<div class={"submenu" + (activeMenu === group ? " active" : "")} id={group}>{stack}</div>];

        return thisMenu.concat(childStack);
    }

    handleBreadcrumbClick = (e: any) => {
        e.preventDefault();
        this.setState({
            selectedMenu: e.currentTarget.dataset.id,
        });
    }

    renderBreadcrumbs = (state: IMenuState) => {
        const breadcrumbs = [];
        if (state.selectedMenu !== "top") {
            const activeItem = this.getActiveMenuItem(state);
            breadcrumbs.push(<a href="#" data-id={activeItem.key} onClick={(e) => this.handleBreadcrumbClick(e)}>{activeItem.text}</a>);

            let parent = activeItem.parent;
            while (parent != null) {
                breadcrumbs.push(<a data-id={parent.key} onClick={(e) => this.handleBreadcrumbClick(e)}>{parent.text}</a>);
                parent = parent.parent;
            }
        }

        breadcrumbs.push(<a href="#" data-id="top" onClick={(e) => this.handleBreadcrumbClick(e)}>☺</a>);
        return breadcrumbs.reverse();
    }

    render(props: IMenuProps, state: IMenuState) {
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    {this.renderBreadcrumbs(state)}
                </div>
                <div class="menu-items">
                    {this.getChildMenu(MENU_ITEMS, state.selectedMenu, "top")}
                </div>
                <div class="menu-bottom">
                    {/* support for this needs to be added to the grid positioning calc
                    <a onClick={() => this.setZoom(1)}>1</a>
                    <a onClick={() => this.setZoom(2)}>2</a>
                    <a onClick={() => this.setZoom(3)}>3</a>
                    */}
                </div>
            </div>
        );
    }
}

export { Menu };
