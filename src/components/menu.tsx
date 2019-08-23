import * as _ from "lodash";
import { Component, h } from "preact";
import { connect } from "react-redux";
import { BUILDINGS, IInspectTarget, IMenuItem, MENU_IDS, MENU_ITEM, MENU_ITEMS, MENU_KEYS, Point, SUBMENU_MAX_H, SUBMENUS } from "./constants";
import { inspectTileAtMapCoord } from "./redux/inspect/actions";
import { selectMenu, selectMenuItem } from "./redux/menu/actions";
import { setStrictMode } from "./redux/settings/actions";
import { ReduxState } from "./redux/store";

interface IMenuProps {
    currentMenu: string;
    currentMenuItem: MENU_ITEM;
    inspecting: boolean;
    inspectedBuildings: IInspectTarget[];
    isDesignating: boolean;
    strictMode: boolean;

    selectMenu: (id: string) => void;
    selectMenuItem: (id: string) => void;
    setStrictMode: (val: boolean) => void;
    inspectTileAtMapCoord: (coord: Point) => void;
}

const mapStateToProps = (state: ReduxState) => ({
    currentMenu: state.menu.currentMenu,
    currentMenuItem: state.menu.currentMenuItem,
    inspecting: state.inspect.inspecting,
    inspectedBuildings: state.inspect.inspectedBuildings,
    isDesignating: state.designator.isDesignating,
    strictMode: state.settings.strictMode,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (id) => dispatch(selectMenu(id)),
    selectMenuItem: (id) => dispatch(selectMenuItem(id)),
    setStrictMode: (val) => dispatch(setStrictMode(val)),
    inspectTileAtMapCoord: (coord) => dispatch(inspectTileAtMapCoord(coord)),
});

class Menu extends Component<IMenuProps, {}> {
    constructor(props: IMenuProps) {
        super();
    }

    componentDidMount = () => {
        window.addEventListener("keydown", this.handleKeyPress);
    }

    render = (props: IMenuProps, state: any) => {
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    {this.renderBreadcrumbs()}
                </div>
                <div class="menu-items" style={this.getMenuItemsCss()}>
                    {this.getChildMenu(MENU_ITEMS, "top")}
                </div>
                {this.renderMenuToolbar()}
                <div class="menu-bottom">
                    <div class="menu-status">
                        {this.renderMenuStatus()}
                    </div>
                    <div class="strict-mode">
                        <input id="strictmode" checked={props.strictMode} type="checkbox" onChange={this.handleStrictModeChange} />
                        <label title="Toggle Strict Mode" for="strictmode">Strict Mode:</label>
                    </div>
                    <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
                </div>
            </div>
        );
    }

    renderBreadcrumbs = () => {
        const breadcrumbs = [];
        if (this.props.currentMenu !== "top") {
            const activeItem = MENU_KEYS[this.props.currentMenu];
            breadcrumbs.push(<a href="#" data-id={activeItem.key} onClick={(e) => this.breadcrumbHandler(e)}>{activeItem.text}</a>);

            // let parent = activeItem.parent;
            // while (parent != null) {
            //     breadcrumbs.push(<a href="#" data-id={parent.key} onClick={(e) => this.breadcrumbHandler(e)}>{parent.text}</a>);
            //     parent = parent.parent;
            // }
        }

        breadcrumbs.push(<a href="#" data-id="top" title="Main Menu" onClick={(e) => this.breadcrumbHandler(e)}>☺</a>);
        return breadcrumbs.reverse();
    }

    breadcrumbHandler = (e: Event) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
        const key = (e.currentTarget as HTMLElement).dataset.id;
        if (key === "top") {
            this.handleMenuEvent("top");
        } else if (MENU_KEYS[key] != null) {
            this.handleMenuEvent(MENU_KEYS[key].id);
        }
    }

    renderMenuStatus = () => {
        if (this.props.isDesignating) {
            return (
                <div>Designating {MENU_IDS[this.props.currentMenuItem].text}</div>
            );
        }
        if (this.props.currentMenuItem != null && this.props.currentMenuItem.length > 0) {
            if (this.props.currentMenuItem in BUILDINGS) {
                return (
                    <div>Placing {MENU_IDS[this.props.currentMenuItem].text}</div>
                );
            }
            return (
                <div>Designating {MENU_IDS[this.props.currentMenuItem].text}</div>
            );
        }
        return <div></div>;
    }

    renderMenuToolbar = () => {
        // shows if a building is selected
        if (this.props.inspectedBuildings == null) {
            return null;
        }
        const self = this;
        return (
            <div class="menu-toolbar">
                {this.props.inspectedBuildings.map((m) => (
                    <a href="#" onClick={this.handleInspectClick.bind(self, m.key)}>
                        {m.display_name}
                    </a>
                ))}
            </div>
        );
    }

    handleInspectClick = (key, e) => {
        e.preventDefault();
        this.props.inspectTileAtMapCoord(key);
    }

    handleMenuEvent = (e: string) => {
        if (e === "top") {
            this.props.selectMenu("top");
        } else if (SUBMENUS[e] != null) {
            this.props.selectMenu(SUBMENUS[e]);
        } else if (this.props.currentMenuItem !== e) {
            this.props.selectMenuItem(e as MENU_ITEM);
        }
    }

    handleStrictModeChange = (e: Event) => {
        this.props.setStrictMode((e.currentTarget as any).checked);
    }

    handleKeyPress = (e: KeyboardEvent) => {
        const key = this.props.currentMenu !== "top" ? this.props.currentMenu + ":" + e.key : e.key;
        const hotkeyTarget = MENU_KEYS[key];
        if (hotkeyTarget) {
            e.preventDefault();
            this.handleMenuEvent(MENU_KEYS[key].id);
        }
    }

    getMenuItemsCss = () => {
        return {
            minHeight: (SUBMENU_MAX_H * 21) + 10,
        };
    }

    menuItemClickHandler = (e) => {
        e.preventDefault();
        this.menuItemHandler(e.currentTarget.id);
    }

    menuItemHandler = (key: string) => {
        if (key === "top") {
            this.handleMenuEvent("top");
        } else if (MENU_KEYS[key] != null) {
            this.handleMenuEvent(MENU_KEYS[key].id);
        }
    }

    //render each individual menu with separate keys
    getChildMenu(items: IMenuItem[], group: string, prefix?: string) {
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
                <a onClick={(e) => this.menuItemClickHandler(e)}
                    title={i.text}
                    class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === i.id ? " active" : "")}
                    id={prefix + i.key}>{i.key}: {i.text}</a>
            ));
            if (i.children != null && i.children.length > 0) {
                childStack.push(this.getChildMenu(i.children, prefix + i.key, prefix + i.key));
            }
        }

        const thisMenu: any[] = [<div class={"submenu" + (this.props.currentMenu === group ? " active" : "")}>{stack}</div>];

        return thisMenu.concat(childStack);
    }
}

// export { Menu };

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
