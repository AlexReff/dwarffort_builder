import { MENU_ID } from "../../constants";
import {
    clearHighlightBuildings,
    deleteBuildings,
    highlightBuildings,
    IBuildingState,
    ICameraState,
    IInspectState,
    inspectAllOfType,
    removeInspectBuildings,
    selectMenu,
    setInspectBuildings,
    useThunkDispatch,
} from "../../redux/";

export {
    Menu,
} from "./menu";

export const handleMenuEvent = (e: Event, id: string, dispatch: ReturnType<typeof useThunkDispatch>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).blur();
    if (id != null && id.length !== 0) {
        dispatch(selectMenu(id as MENU_ID));
    }
};

export const handleInspectHoverEnter = (e: MouseEvent | TouchEvent, targets: string[], dispatch: ReturnType<typeof useThunkDispatch>) => {
    e.preventDefault();
    dispatch(highlightBuildings(targets));
};

export const handleInspectHoverLeave = (e: MouseEvent | TouchEvent, dispatch: ReturnType<typeof useThunkDispatch>) => {
    e.preventDefault();
    dispatch(clearHighlightBuildings());
};

export const handleExpandClick = (
    e: MouseEvent | TouchEvent,
    key: string,
    expandedToolbarItems: string[],
    setExpandedToolbarItems: (val: string[]) => void,
) => {
    e.preventDefault();
    if (expandedToolbarItems.some((m) => m === key)) {
        setExpandedToolbarItems(expandedToolbarItems.filter((m) => m !== key));
    } else {
        setExpandedToolbarItems(expandedToolbarItems.concat([key]));
    }
};

export const handleMenuToolbarClick = (key: string, e: TouchEvent | MouseEvent, shiftDown: boolean, dispatch: ReturnType<typeof useThunkDispatch>) => {
    e.preventDefault();
    if (shiftDown) {
        //remove this from inspected bldg list
        dispatch(removeInspectBuildings([key]));
    } else {
        //set this as only inspected bldg
        dispatch(setInspectBuildings([key]));
    }
};

export const handleDeleteClick = (
    e: MouseEvent | TouchEvent,
    targets: string[],
    cameraZ: ICameraState["cameraZ"],
    dispatch: ReturnType<typeof useThunkDispatch>,
) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete these buildings?")) {
        dispatch(deleteBuildings(cameraZ, targets));
    }
};

export const handleDeselectClick = (
    e: MouseEvent | TouchEvent,
    typeKey: string,
    inspectedBuildings: IInspectState["inspectedBuildings"],
    buildingTiles: IBuildingState["buildingTiles"],
    cameraZ: ICameraState["cameraZ"],
    dispatch: ReturnType<typeof useThunkDispatch>,
) => {
    e.preventDefault();
    const keysOfType = Object.values(buildingTiles[cameraZ]).filter((m) => m.key === typeKey).map((m) => `${m.posX}:${m.posY}`);
    const toRemove = inspectedBuildings.filter((m) => keysOfType.some((n) => n === m));
    dispatch(removeInspectBuildings(toRemove));
};

export const handleSelectAllClick = (e: MouseEvent | TouchEvent, targetKey: string, dispatch: ReturnType<typeof useThunkDispatch>) => {
    e.preventDefault();
    dispatch(inspectAllOfType(targetKey as MENU_ID));
};
