import { Component, h } from "preact";
import { IGameMenuState, IMenuProps } from ".";
import { BUILDING_KEYS, BUILDINGS, IMenuItem, INPUT_STATE, MENU, MENU_ID, MENU_KEYS } from "../../constants";

export class Menu extends Component<IMenuProps, IGameMenuState> {
    constructor() {
        super();
        this.setState({
            expandedToolbarItems: [],
        });
    }

    componentDidUpdate = (prevProps: Readonly<IMenuProps>, prevState: Readonly<IGameMenuState>, snapshot: any) => {
        if (prevProps.inspectedBuildings !== this.props.inspectedBuildings) {
            this.setState({
                expandedToolbarItems: [],
            });
        }
    }

    render = (props: IMenuProps) => {
        const activeSubmenu = MENU.ITEMS[this.props.currentSubmenu];
        const breadcrumbTarget = (
            this.props.currentSubmenu != null &&
            this.props.currentSubmenu !== MENU_ID.top &&
            activeSubmenu != null &&
            activeSubmenu.text != null &&
            activeSubmenu.text.length > 0
        ) ? activeSubmenu : null;
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    <a href="#" title="Main Menu" onClick={(e) => this.handleBreadcrumbClick(e, "top")}>☺</a>
                    {breadcrumbTarget != null ?
                        <a href="#" onClick={(e) => this.handleBreadcrumbClick(e, breadcrumbTarget.id)}>{breadcrumbTarget.text}</a>
                        : null}
                </div>
                {this.renderMainMenu()}
                {this.renderMenuToolbar()}
                <div class="menu-bottom">
                    <div class="menu-status">
                        {this.renderMenuStatus()}
                    </div>
                    {this.renderCursorInfo()}
                    <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
                </div>
            </div>
        );
    }

    renderMainMenu = () => {
        switch (this.props.inputState) {
            case INPUT_STATE.PLACING_BUILDING: {
                let placedZ = -1;
                let placedAll = -1;
                if (this.props.cameraZ in this.props.buildingTiles) {
                    placedZ = Object.keys(this.props.buildingTiles[this.props.cameraZ]).reduce((map, val) => {
                        return map + (this.props.buildingTiles[this.props.cameraZ][val].key === this.props.currentMenuItem ? 1 : 0);
                    }, 0);
                    if (Object.keys(this.props.buildingTiles).length > 1) {
                        //check how many buildings exist across all z-levels
                        placedAll = Object.keys(this.props.buildingTiles).reduce((map, floor) => {
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
                        <div>Placing {BUILDINGS.ITEMS[this.props.currentMenuItem].text}</div>
                        {placedZ > -1 ?
                            <div>Placed (current Z): {placedZ}</div>
                            : null}
                        {placedAll > -1 ?
                            <div>Placed (all floors): {placedAll}</div>
                            : null}
                    </div>
                );
            }
            default:
                return (
                    <div class="menu-items">
                        {Object.keys(MENU.SUBMENUS).map((key) => (
                            <div class={"submenu" + (this.props.currentSubmenu === key ? " active" : "")}>
                                {key in BUILDINGS.SUBMENUS ?
                                    BUILDINGS.SUBMENUS[key].map((bldg: IMenuItem) => (
                                        <a onClick={(e) => this.handleMenuItemClick(e, bldg.id)}
                                            class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === bldg.id ? " active" : "")}
                                            title={bldg.text}>{bldg.key}: {bldg.text}</a>
                                    )) : null}
                                {MENU.SUBMENUS[key] != null && MENU.SUBMENUS[key].length > 0 ?
                                    MENU.SUBMENUS[key].map((item: IMenuItem) => {
                                        if (item.text == null || item.text.length === 0) {
                                            return;
                                        }
                                        return (
                                            <a onClick={(e) => this.handleMenuItemClick(e, item.id)}
                                                class={"menu-item" + (this.props.currentMenuItem != null && this.props.currentMenuItem === item.id ? " active" : "")}
                                                title={item.text}>{item.key}: {item.text}</a>
                                        );
                                    }) : null}
                            </div>
                        ))}
                    </div>
                );
        }
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
        }, {} as { [key: string]: string[] });
        return (
            <div class="menu-toolbar">
                {Object.keys(listItems).map((m) => (
                    <div class={"entry" + (this.state.expandedToolbarItems.some((n) => m === n) ? " expanded" : "")}>
                        <div class="entry_title">
                            <a href="#"
                                title={listItems[m].length > 1 ? "Delete Buildings" : "Delete Building"}
                                class="entry_delete"
                                onClick={(e) => this.handleDeleteClick(e, listItems[m])}><i class="far fa-times-circle"></i></a>
                            <a class={"entry_name" + (listItems[m].length > 1 ? " has_multi" : "")} href="#"
                                onMouseEnter={(e) => this.handleInspectHoverEnter(e, listItems[m])}
                                onMouseLeave={this.handleInspectHoverLeave}
                                onClick={(e) => listItems[m].length > 1 ?
                                    this.handleExpandClick(e, m) :
                                    this.handleMenuToolbarClick(listItems[m][0], e)}>
                                {BUILDINGS.ITEMS[m as BUILDING_KEYS].text}
                                {listItems[m].length > 1 ?
                                    <span>(x{listItems[m].length})</span>
                                    : null}
                                {Object.values(this.props.buildingTiles[this.props.cameraZ]).filter((tile) => tile.key === m).length > 1 ?
                                    <a href="#"
                                        title={`Select All ${BUILDINGS.ITEMS[m as BUILDING_KEYS].text}`}
                                        class="entry_select_all"
                                        onClick={(e) => this.handleSelectAllClick(e, m)}><i class="fas fa-object-group"></i></a>
                                    : null}
                            </a>
                        </div>
                        {/* <div class="entry_options">
                            <a href="#">X Clone</a>
                            <ul>
                                <li><a href="#" onClick={(e) => this.handleSelectAllClick(e, m)}>Select All</a></li>
                                <li><a href="#" onClick={(e) => this.handleDeleteClick(e, listItems[m])}>Delete</a></li>
                            </ul>
                        </div> */}
                        {listItems[m].length > 1 ?
                            <div class="entry_singles">
                                {listItems[m].map((key) => {
                                    return (
                                        <div class="entry_child">
                                            <a class="entry_name" href="#"
                                                onMouseEnter={(e) => this.handleInspectHoverEnter(e, [key])}
                                                onMouseLeave={this.handleInspectHoverLeave}
                                                onClick={(e) => this.handleMenuToolbarClick(key, e)}>
                                                {BUILDINGS.ITEMS[m as BUILDING_KEYS].text}
                                            </a>
                                            <div class="entry_options">
                                                <ul>
                                                    <li><a href="#" onClick={(e) => this.handleUnselectClick(e, key)}>Unselect</a></li>
                                                    <li><a href="#" onClick={(e) => this.handleDeleteClick(e, [key])}>Delete</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            : null}
                    </div>
                ),
                )}
            </div>
        );
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
                    <div>Designating {MENU.ITEMS[this.props.currentMenuItem as MENU_KEYS].text}</div>
                );
            }
            case INPUT_STATE.PLACING_BUILDING: {
                return (
                    <div>Placing {BUILDINGS.ITEMS[this.props.currentMenuItem as BUILDING_KEYS].text}</div>
                );
            }
        }
    }

    renderCursorInfo = () => {
        //
    }

    //#region handlers
    handleBreadcrumbClick = (e: Event, id: string) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
        this.handleMenuEvent(id);
    }

    handleMenuToolbarClick = (key: string, e: TouchEvent | MouseEvent) => {
        e.preventDefault();
        if (this.props.shiftDown) {
            //remove this from inspected bldg list
            this.props.removeInspectBuilding(key);
        } else {
            //set this as only inspected bldg
            this.props.setInspectBuildings([key]);
        }
    }

    handleExpandClick = (e: MouseEvent | TouchEvent, key: string) => {
        e.preventDefault();
        if (this.state.expandedToolbarItems.some((m) => m === key)) {
            this.setState({
                expandedToolbarItems: this.state.expandedToolbarItems.filter((m) => m !== key),
            });
        } else {
            this.setState({
                expandedToolbarItems: this.state.expandedToolbarItems.concat([key]),
            });
        }
    }

    handleDeleteClick = (e: MouseEvent | TouchEvent, targets: string[]) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete these buildings?")) {
            this.props.deleteBuildings(this.props.cameraZ, targets);
        }
    }

    handleSelectAllClick = (e: MouseEvent | TouchEvent, targetKey: string) => {
        e.preventDefault();
        this.props.inspectAllOfType(targetKey as MENU_ID);
    }

    handleUnselectClick = (e: MouseEvent | TouchEvent, targetKey: string) => {
        e.preventDefault();
        this.props.removeInspectBuilding(targetKey);
    }

    handleInspectHoverEnter = (e: MouseEvent | TouchEvent, targets: string[]) => {
        e.preventDefault();
        this.props.highlightBuildings(targets);
    }

    handleInspectHoverLeave = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        this.props.clearHighlightBuildings();
    }

    handleMenuItemClick = (e: Event, id: string) => {
        e.preventDefault();
        this.handleMenuEvent(id);
    }

    handleMenuEvent = (e: string) => {
        if (e == null || e.length === 0) {
            return;
        }
        this.props.selectMenu(e as MENU_ID);
    }
    //#endregion handlers
}
