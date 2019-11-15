import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import {
    handleDeleteClick,
    handleDeselectClick,
    handleExpandClick,
    handleInspectHoverEnter,
    handleInspectHoverLeave,
    handleMenuToolbarClick,
    handleSelectAllClick,
} from ".";
import { BUILDING_KEYS, BUILDINGS } from "../../constants";
import {
    useSelectors,
    useThunkDispatch,
} from "../../redux";

export const Toolbar = () => {
    const [expandedToolbarItems, setExpandedToolbarItems] = useState<string[]>([]);
    const dispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "buildingTiles",
        "cameraZ",
        "inspectedBuildings",
        "shiftDown",
    ]);

    //keep the inspected items up-to-date
    useEffect(() => {
        if (reduxState.inspectedBuildings?.length === 0) {
            return;
        }
        const filtered = expandedToolbarItems.filter((m) => reduxState.inspectedBuildings.some((n) => m === n));
        if (filtered.length !== expandedToolbarItems.length) {
            setExpandedToolbarItems(filtered);
        }
    });

    if (reduxState.inspectedBuildings?.length === 0) {
        return null;
    }

    const listItems: { [key: string]: string[] } = reduxState.inspectedBuildings.reduce((obj, val) => {
        const bldgTile = reduxState.buildingTiles[reduxState.cameraZ][val];
        if (bldgTile.key in obj) {
            obj[bldgTile.key].push(val);
        } else {
            obj[bldgTile.key] = [val];
        }
        return obj;
    }, {} as { [key: string]: string[] });

    return (
        <div class="menu-toolbar">
            {Object.keys(listItems).map((m) => {
                const selectedCount = listItems[m].length;
                const allCount = Object.values(reduxState.buildingTiles[reduxState.cameraZ]).filter((tile) => tile.key === m).length;
                return (
                    <div class={"entry" + (expandedToolbarItems.some((n) => m === n) ? " expanded" : "")}>
                        <div class="entry_title">
                            <a class={"entry_name" + (selectedCount > 1 ? " has_multi" : "")} href="#"
                                onMouseEnter={(e) => handleInspectHoverEnter(e, listItems[m], dispatch)}
                                onMouseLeave={(e) => handleInspectHoverLeave(e, dispatch)}
                                onClick={(e) => selectedCount > 1 ?
                                    handleExpandClick(e, m, expandedToolbarItems, setExpandedToolbarItems) :
                                    handleMenuToolbarClick(listItems[m][0], e, reduxState.shiftDown, dispatch)}>
                                {BUILDINGS.ITEMS[m as BUILDING_KEYS].text}
                            </a>
                            {allCount > 1 ?
                                selectedCount === allCount ?
                                    <a href="#" class="entry_select_all"
                                        title={`Unselect All ${BUILDINGS.ITEMS[m as BUILDING_KEYS].text}`}
                                        onClick={(e) => handleDeselectClick(e, m, reduxState.inspectedBuildings, reduxState.buildingTiles, reduxState.cameraZ, dispatch)}>
                                        <i class="far fa-check-square"></i> {selectedCount}/{allCount}
                                    </a> :
                                    <a href="#" class="entry_select_all"
                                        title={`Select All ${BUILDINGS.ITEMS[m as BUILDING_KEYS].text}`}
                                        onClick={(e) => handleSelectAllClick(e, m, dispatch)}>
                                        <i class="far fa-check-square"></i> {selectedCount}/{allCount}
                                    </a>
                                : null}
                            <a href="#" class="entry_delete"
                                title={selectedCount > 1 ? "Delete Buildings" : "Delete Building"}
                                onClick={(e) => handleDeleteClick(e, listItems[m], reduxState.cameraZ, dispatch)}><i class="far fa-times-circle"></i></a>
                        </div>
                        {listItems[m].length > 1 ?
                            <div class="entry_singles">
                                {listItems[m].map((key) => {
                                    return (
                                        <div class="entry_child">
                                            <a class="entry_name" href="#"
                                                onMouseEnter={(e) => handleInspectHoverEnter(e, [key], dispatch)}
                                                onMouseLeave={(e) => handleInspectHoverLeave(e, dispatch)}
                                                onClick={(e) => handleMenuToolbarClick(key, e, reduxState.shiftDown, dispatch)}>
                                                {BUILDINGS.ITEMS[m as BUILDING_KEYS].text}
                                            </a>
                                            {/* <a href="#" onClick={(e) => this.handleUnselectClick(e, key)}>Deselect</a> */}
                                            <a href="#" class="entry_delete"
                                                title={selectedCount > 1 ? "Delete Buildings" : "Delete Building"}
                                                onClick={(e) => handleDeleteClick(e, [key], reduxState.cameraZ, dispatch)}><i class="far fa-times-circle"></i></a>
                                            {/* <div class="entry_options">
                                                <ul>
                                                    <li><a href="#" onClick={(e) => this.handleUnselectClick(e, key)}>Unselect</a></li>
                                                    <li><a href="#" onClick={(e) => this.handleDeleteClick(e, [key])}>Delete</a></li>
                                                </ul>
                                            </div> */}
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
};
