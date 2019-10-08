import { Component, h } from "preact";
import { connect } from "react-redux";
import { BUILDINGS, INPUT_STATE, MENU, MENU_ITEM, SUBMENU_MAX_H } from "../constants";
import { deleteBuildings } from "../redux/building/actions";
import { IBuildingState } from "../redux/building/reducer";
import { ICameraState } from "../redux/camera/reducer";
import { IInputState } from "../redux/input/reducer";
import { inspectAllOfType, removeInspectBuilding, setInspectBuildings } from "../redux/inspect/actions";
import { IInspectState } from "../redux/inspect/reducer";
import { selectMenu } from "../redux/menu/actions";
import { IMenuState } from "../redux/menu/reducer";
import { ReduxState } from "../redux/store";

interface IMenuProps {
    currentMenu: IMenuState["currentSubmenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    inputState: IInputState["inputState"];
    buildingTiles: IBuildingState["buildingTiles"];
    inspectedBuildings: IInspectState["inspectedBuildings"];
    cameraZ: ICameraState["cameraZ"];
    shiftDown: IInputState["shiftDown"];

    selectMenuItem: (id: string) => void;
    removeInspectBuilding: (item: string) => void;
    setInspectBuildings: (item: string[]) => void;
    deleteBuildings: (cameraZ: number, targets: string[]) => void;
    inspectAllOfType: (type: string) => void;
}

const mapStateToProps = (state: ReduxState) => ({
    currentMenu: state.menu.currentSubmenu,
    currentMenuItem: state.menu.currentMenuItem,
    inputState: state.input.inputState,
    inspectedBuildings: state.inspect.inspectedBuildings,
    buildingTiles: state.building.buildingTiles,
    cameraZ: state.camera.cameraZ,
    shiftDown: state.input.shiftDown,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenuItem: (id) => dispatch(selectMenu(id)),
    removeInspectBuilding: (item) => dispatch(removeInspectBuilding(item)),
    setInspectBuildings: (items) => dispatch(setInspectBuildings(items)),
    deleteBuildings: (cameraZ, targets) => dispatch(deleteBuildings(cameraZ, targets)),
    inspectAllOfType: (type) => dispatch(inspectAllOfType(type)),
});

interface IGameMenuState {
    // shiftDown: boolean;
}

class Menu extends Component<IMenuProps, IGameMenuState> {
    constructor() {
        super();
        // this.setState({
        //     // shiftDown: false,
        // });
    }

    render = (props: IMenuProps) => {
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    {this.renderBreadcrumbs()}
                </div>
                {this.renderMainMenu()}
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

    renderMainMenu = () => {
        switch (this.props.inputState) {
            case INPUT_STATE.PLACING_BUILDING: {
                let placed = -1;
                let placedZ = -1;
                if (this.props.cameraZ in this.props.buildingTiles) {
                    placed = Object.keys(this.props.buildingTiles[this.props.cameraZ]).reduce((map, val) => {
                        return map + (this.props.buildingTiles[this.props.cameraZ][val].key === this.props.currentMenuItem ? 1 : 0);
                    }, 0);
                    if (Object.keys(this.props.buildingTiles).length > 1) {
                        //check how many buildings exist across all z-levels
                        placedZ = Object.keys(this.props.buildingTiles).reduce((map, floor) => {
                            return Object.keys(this.props.buildingTiles[floor]).reduce((thisFloor, pos) => {
                                if (this.props.buildingTiles[floor][pos].key === this.props.currentMenuItem) {
                                    return thisFloor + 1;
                                } else {
                                    return thisFloor;
                                }
                            }, 0);
                        }, 0);
                    }
                }
                return (
                    <div class="menu-place">
                        <div>Placing {BUILDINGS.ITEMS[this.props.currentMenuItem].display_name}</div>
                        {placed > -1 ?
                            <div>Placed (current Z): {placed}</div>
                            : null}
                        {placedZ > -1 ?
                            <div>Placed (all floors): {placedZ}</div>
                            : null}
                    </div>
                );
            }
            default:
                return (
                    <div class="menu-items" style={{/* minHeight: `${SUBMENU_MAX_H * 20}px` */ }}>
                        {Object.keys(MENU.SUBMENUS).map((key) => (
                            <div class={"submenu" + (this.props.currentMenu === key ? " active" : "")}>
                                {key in BUILDINGS.SUBMENUS ?
                                    BUILDINGS.SUBMENUS[key].map((bldg) => (
                                        <a onClick={(e) => this.menuItemClickHandler(e)}
                                            title={bldg.display_name}
                                            class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === bldg.id ? " active" : "")}
                                            data-id={bldg.id}>{bldg.hotkey}: {bldg.display_name}</a>
                                    )) : null}
                                {MENU.SUBMENUS[key] != null && MENU.SUBMENUS[key].length > 0 ?
                                    MENU.SUBMENUS[key].map((item) => (
                                        <a onClick={(e) => this.menuItemClickHandler(e)}
                                            title={item.text}
                                            class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === item.id ? " active" : "")}
                                            data-id={item.id}>{item.key}: {item.text}</a>
                                    )) : null}
                            </div>
                        ))}
                    </div>
                );
        }
    }

    renderBreadcrumbs = () => {
        const breadcrumbs = [];
        if (this.props.currentMenu !== MENU_ITEM.top) {
            const activeItem = MENU.ITEMS[this.props.currentMenu];
            breadcrumbs.push(<a href="#" data-id={activeItem.id} onClick={(e) => this.breadcrumbHandler(e)}>{activeItem.text}</a>);
        }

        breadcrumbs.push(<a href="#" data-id={MENU_ITEM.top.toString()} title="Main Menu" onClick={(e) => this.breadcrumbHandler(e)}>☺</a>);
        return breadcrumbs.reverse();
    }

    breadcrumbHandler = (e: Event) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
        const key = (e.currentTarget as HTMLElement).dataset.id;
        this.handleMenuEvent(key);
    }

    renderMenuStatus = () => {
        switch (this.props.inputState) {
            case INPUT_STATE.INSPECTING: {
                return (
                    <div></div>
                );
            }
            case INPUT_STATE.DESIGNATING: {
                return (
                    <div>Designating {MENU.ITEMS[this.props.currentMenuItem].text}</div>
                );
            }
            case INPUT_STATE.PLACING_BUILDING: {
                return (
                    <div>Placing {BUILDINGS.ITEMS[this.props.currentMenuItem].display_name}</div>
                );
            }
        }
    }

    handleMenuToolbarClick = (key, e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        if (this.props.shiftDown) {
            //remove this from inspected bldg list
            this.props.removeInspectBuilding(key);
        } else {
            //set this as only inspected bldg
            this.props.setInspectBuildings([key]);
        }
    }

    handleExpandClick = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        let parent = (e.currentTarget as HTMLElement).parentElement;
        while (parent != null && !parent.classList.contains("entry")) {
            parent = parent.parentElement;
        }
        parent.classList.toggle("expanded");
        //TODO: Update this to have an array of items that
        //      is then checked inside render, instead of
        //      binding it to an event
        //      then add handlers for other events to reset the list
    }

    handleDeleteClick = (e: MouseEvent | TouchEvent, targets: string[]) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete these buildings?")) {
            this.props.deleteBuildings(this.props.cameraZ, targets);
        }
    }

    handleSelectAllClick = (e: MouseEvent | TouchEvent, targetKey: string) => {
        e.preventDefault();
        this.props.inspectAllOfType(targetKey);
    }

    renderMenuToolbar = () => {
        // shows if a building is selected
        if (this.props.inspectedBuildings == null ||
            this.props.inspectedBuildings.length === 0) {
            return null;
        }
        const listItems: { [key: string]: string[] } = this.props.inspectedBuildings.reduce((obj, val) => {
            const bldgTile = this.props.buildingTiles[this.props.cameraZ][val];
            if (bldgTile.key in obj) {
                obj[bldgTile.key].push(val);
            } else {
                obj[bldgTile.key] = [val];
            }
            return obj;
        }, {});
        return (
            <div class="menu-toolbar">
                {Object.keys(listItems).map((m) => {
                    return (
                        <div class="entry">
                            <div class="entry_title">
                                <a class={"entry_name" + (listItems[m].length > 1 ? " has_multi" : "")} href="#"
                                    onClick={(e) => listItems[m].length > 1 ? this.handleExpandClick(e) : this.handleMenuToolbarClick(listItems[m][0], e)}>
                                    {BUILDINGS.ITEMS[m].display_name} <span>(x{listItems[m].length})</span>
                                </a>
                            </div>
                            <div class="entry_options">
                                {/* <a href="#">X Clone</a> */}
                                <ul>
                                    <li><a href="#" onClick={(e) => this.handleSelectAllClick(e, m)}>Select All</a></li>
                                    <li><a href="#" onClick={(e) => this.handleDeleteClick(e, listItems[m])}>Delete</a></li>
                                </ul>
                            </div>
                            {listItems[m].length > 1 ?
                                <div class="entry_singles">
                                    {listItems[m].map((key) => {
                                        return (
                                            <div class="entry_child">
                                                <a class="entry_name" href="#"
                                                    onClick={(e) => this.handleMenuToolbarClick(key, e)}>
                                                    {BUILDINGS.ITEMS[m].display_name}
                                                </a>
                                                <div class="entry_options">
                                                    <ul>
                                                        <li><a href="#" /*onClick={(e) => this.handleSelectAllClick(e, m)}*/>Unselect</a></li>
                                                        <li><a href="#" onClick={(e) => this.handleDeleteClick(e, [key])}>Delete</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                : null}
                        </div>
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

    menuItemClickHandler = (e: Event) => {
        e.preventDefault();
        this.handleMenuEvent((e.currentTarget as HTMLElement).dataset.id);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
