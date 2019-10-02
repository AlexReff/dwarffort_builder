import * as _ from "lodash";
import { Component, h } from "preact";
import { connect } from "react-redux";
import { BUILDINGS, KEYS, MENU, SUBMENU_MAX_H } from "../constants";
import { IBuildingState } from "../redux/building/reducer";
import { ICameraState } from "../redux/camera/reducer";
import { IDiggerState } from "../redux/digger/reducer";
import { removeInspectBuilding, setInspectBuildings } from "../redux/inspect/actions";
import { IInspectState } from "../redux/inspect/reducer";
import { selectMenu } from "../redux/menu/actions";
import { IMenuState } from "../redux/menu/reducer";
import { ReduxState } from "../redux/store";

interface IMenuProps {
    currentMenu: IMenuState["currentSubmenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    isInspecting: IMenuState["isInspecting"];
    buildingTiles: IBuildingState["buildingTiles"];
    isDesignating: IDiggerState["isDesignating"];
    inspectedBuildings: IInspectState["inspectedBuildings"];
    cameraZ: ICameraState["cameraZ"];

    selectMenuItem: (id: string) => void;
    removeInspectBuilding: (item: string) => void;
    setInspectBuildings: (item: string[]) => void;
    // inspectTileAtMapCoord: (coord: Point, add: boolean) => void;
}

const mapStateToProps = (state: ReduxState) => ({
    currentMenu: state.menu.currentSubmenu,
    currentMenuItem: state.menu.currentMenuItem,
    isInspecting: state.menu.isInspecting,
    inspectedBuildings: state.inspect.inspectedBuildings,
    buildingTiles: state.building.buildingTiles,
    cameraZ: state.camera.cameraZ,
    isDesignating: state.digger.isDesignating,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenuItem: (id) => dispatch(selectMenu(id)),
    removeInspectBuilding: (item) => dispatch(removeInspectBuilding(item)),
    setInspectBuildings: (items) => dispatch(setInspectBuildings(items)),
    // inspectTileAtMapCoord: (coord, add) => dispatch(inspectRequestAtMapCoord(coord, add)),
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
        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyPress = (e) => {
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: true,
            });
        }
    }

    handleKeyUp = (e) => {
        if (e.keyCode === KEYS.VK_SHIFT) {
            this.setState({
                shiftDown: false,
            });
        }
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
                    <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
                </div>
            </div>
        );
    }

    renderBreadcrumbs = () => {
        const breadcrumbs = [];
        if (this.props.currentMenu !== "top") {
            const activeItem = MENU.ITEMS[this.props.currentMenu];
            breadcrumbs.push(<a href="#" data-id={activeItem.id} onClick={(e) => this.breadcrumbHandler(e)}>{activeItem.text}</a>);

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
        if (this.props.isInspecting) {
            return <div></div>;
        }
        if (this.props.isDesignating) {
            return (
                <div>Designating {MENU.ITEMS[this.props.currentMenuItem].text}</div>
            );
        }
        if (this.props.currentMenuItem != null && this.props.currentMenuItem.length > 0) {
            if (this.props.currentMenuItem in BUILDINGS.ITEMS) {
                return (
                    <div>Placing {BUILDINGS.ITEMS[this.props.currentMenuItem].display_name}</div>
                );
            }
            return (
                <div>Designating {MENU.ITEMS[this.props.currentMenuItem].text}</div>
            );
        }
        return <div></div>;
    }

    handleMenuToolbarClick = (key, e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        if (this.state.shiftDown) {
            //remove this from inspected bldg list
            this.props.removeInspectBuilding(key);
        } else {
            //set this as only inspected bldg
            this.props.setInspectBuildings([key]);
        }
    }

    renderMenuToolbar = () => {
        // shows if a building is selected
        if (this.props.inspectedBuildings == null ||
            this.props.inspectedBuildings.length === 0) {
            return null;
        }
        return (
            <div class="menu-toolbar">
                {this.props.inspectedBuildings.map((m) => {
                    const bldg = this.props.buildingTiles[this.props.cameraZ][m];
                    return (
                        <a href="#" onClick={(e) => this.handleMenuToolbarClick(m, e)}>
                            {BUILDINGS.ITEMS[bldg.key].display_name}
                        </a>
                    );
                })}
            </div>
        );
    }

    handleMenuEvent = (e: string) => {
        if (e == null || e.length === 0) {
            return;
        }
        this.props.selectMenuItem(e);
    }

    getMenuItemsCss = () => {
        return {
            minHeight: (SUBMENU_MAX_H * 21),
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
