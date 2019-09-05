import * as _ from "lodash";
import { Component, h } from "preact";
import { connect } from "react-redux";
import { BUILDINGS, KEYS, MENU, Point, SUBMENU_MAX_H } from "./constants/";
import { IBuildingState } from "./redux/building/reducer";
import { IDesignatorState } from "./redux/designator/reducer";
import { inspectRequestAtMapCoord } from "./redux/inspect/actions";
import { IInspectState } from "./redux/inspect/reducer";
import { selectMenu, selectMenuItem } from "./redux/menu/actions";
import { IMenuState } from "./redux/menu/reducer";
import { setStrictMode } from "./redux/settings/actions";
import { ISettingsState } from "./redux/settings/reducer";
import { ReduxState } from "./redux/store";

interface IMenuProps {
    currentMenu: IMenuState["currentMenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    inspecting: IInspectState["inspecting"];
    inspectedBuildings: IInspectState["inspectedBuildings"];
    isDesignating: IDesignatorState["isDesignating"];
    strictMode: ISettingsState["strictMode"];
    buildingList: IBuildingState["buildingList"];
    buildingIds: IBuildingState["buildingIds"];

    selectMenu: (id: string) => void;
    selectMenuItem: (id: string) => void;
    setStrictMode: (val: boolean) => void;
    inspectTileAtMapCoord: (coord: Point, add: boolean) => void;
}

const mapStateToProps = (state: ReduxState) => ({
    currentMenu: state.menu.currentMenu,
    currentMenuItem: state.menu.currentMenuItem,
    inspecting: state.inspect.inspecting,
    inspectedBuildings: state.inspect.inspectedBuildings,
    isDesignating: state.designator.isDesignating,
    strictMode: state.settings.strictMode,
    buildingList: state.building.buildingList,
    buildingIds: state.building.buildingIds,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (id) => dispatch(selectMenu(id)),
    selectMenuItem: (id) => dispatch(selectMenuItem(id)),
    setStrictMode: (val) => dispatch(setStrictMode(val)),
    inspectTileAtMapCoord: (coord, add) => dispatch(inspectRequestAtMapCoord(coord, add)),
});

interface IGameMenuState {
    shiftDown: boolean;
}

class Menu extends Component<IMenuProps, IGameMenuState> {
    constructor() {
        super();
        this.setState({
            shiftDown: false,
        });
    }

    componentDidMount = () => {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    render = (props: IMenuProps) => {
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    {this.renderBreadcrumbs()}
                </div>
                <div class="menu-items" style={this.getMenuItemsCss()}>
                    {this.getMenu()}
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
            const activeItem = MENU.ITEMS[this.props.currentMenu];
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
        this.handleMenuEvent(key);
    }

    renderMenuStatus = () => {
        if (this.props.isDesignating) {
            return (
                <div>Designating {MENU.ITEMS[this.props.currentMenuItem].text}</div>
            );
        }
        if (this.props.currentMenuItem != null && this.props.currentMenuItem.length > 0) {
            if (this.props.currentMenuItem in BUILDINGS.IDS) {
                return (
                    <div>Placing {BUILDINGS.IDS[this.props.currentMenuItem].display_name}</div>
                );
            }
            return (
                <div>Designating {MENU.ITEMS[this.props.currentMenuItem].text}</div>
            );
        }
        return <div></div>;
    }

    renderMenuToolbar = () => {
        // shows if a building is selected
        if (this.props.inspectedBuildings == null ||
            this.props.inspectedBuildings.length === 0 ||
            this.props.buildingIds == null) {
            return null;
        }
        return (
            <div class="menu-toolbar">
                {this.props.inspectedBuildings.map((m) => {
                    if (m in this.props.buildingIds) {
                        return (
                            <a href="#" onClick={() => this.handleInspectClick.bind(this, m)}>
                                {BUILDINGS.IDS[this.props.buildingIds[m]].display_name}
                            </a>
                        );
                    }
                })}
            </div>
        );
    }

    handleInspectClick = (key, e) => {
        e.preventDefault();
        const coord: Point = key.substr(key.indexOf(":") + 1).split(":").map((m) => +m);
        this.props.inspectTileAtMapCoord(coord, this.state.shiftDown);
    }

    handleMenuEvent = (e: string) => {
        if (e == null || e.length === 0) {
            return;
        }
        this.props.selectMenuItem(e);
    }

    handleStrictModeChange = (e: Event) => {
        this.props.setStrictMode((e.currentTarget as HTMLInputElement).checked);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        let key = "";
        if (this.props.currentMenu !== "top") {
            key = MENU.ITEMS[this.props.currentMenu].parsedKey + ":";
        }
        key += e.key;
        if (key in MENU.KEYS) {
            e.preventDefault();
            this.handleMenuEvent(MENU.KEYS[key].id);
        } else if (key in BUILDINGS.KEYS) {
            e.preventDefault();
            this.handleMenuEvent(BUILDINGS.KEYS[key].id);
        }
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: true,
            });
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: false,
            });
        }
    }

    getMenuItemsCss = () => {
        return {
            minHeight: (SUBMENU_MAX_H * 21) + 10,
        };
    }

    menuItemClickHandler = (e: Event) => {
        e.preventDefault();
        this.handleMenuEvent((e.currentTarget as HTMLElement).dataset.id);
    }

    getMenu = () => {
        const allMenus = [];

        for (const key of Object.keys(MENU.SUBMENUS)) {
            const items = MENU.SUBMENUS[key];
            const resultStack = [];
            if (key in BUILDINGS.SUBMENUS) {
                //populate related buildings
                for (const bldg of BUILDINGS.SUBMENUS[key]) {
                    resultStack.push((
                        <a onClick={(e) => this.menuItemClickHandler(e)}
                            title={bldg.display_name}
                            class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === bldg.id ? " active" : "")}
                            data-id={bldg.id}>{bldg.hotkey}: {bldg.display_name}</a>
                    ));
                }
            }

            if (items != null) {
                for (const item of items) {
                    resultStack.push((
                        <a onClick={(e) => this.menuItemClickHandler(e)}
                            title={item.text}
                            class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === item.id ? " active" : "")}
                            data-id={item.id}>{item.key}: {item.text}</a>
                    ));
                }
            }

            allMenus.push((
                <div class={"submenu" + (this.props.currentMenu === key ? " active" : "")}>
                    {resultStack}
                </div>
            ));
        }

        return allMenus;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
