import {
    _moveInspectedBuildings,
    _setMenus,
    addInspectBuilding,
    addInspectBuildings,
    clearHighlightBuildings,
    decreasePlaceBuildHeight,
    decreasePlaceBuildWidth,
    deleteBuildings,
    highlightBuildings,
    increasePlaceBuildHeight,
    increasePlaceBuildWidth,
    Initialize,
    removeInspectBuildings,
    setBuildings,
    setCameraPos,
    setCameraZ,
    setCursorPos,
    setDesignateStart,
    setDigData,
    setInspectBuildings,
    setMapSize,
    setShiftDown,
    toggleAnimation,
} from ".";

export const enum ACTION_TYPE {
    INITIALIZE,
    SET_MENU,
    SET_CAMERA_POS,
    SET_CURSOR_POS,
    SET_MAP_SIZE,
    SET_ZLEVEL,
    DESIGNATE_START,
    ANIMATION_TOGGLE,
    DESIGNATE_SET_TILES,
    SET_BUILDINGS,
    DELETE_BUILDINGS,
    SET_INSPECT_BUILDINGS,
    ADD_INSPECT_BUILDING,
    REMOVE_INSPECT_BUILDINGS,
    MOVE_INSPECT_BUILDINGS,
    PLACEBUILD_WIDTH_INCREASE,
    PLACEBUILD_HEIGHT_INCREASE,
    PLACEBUILD_WIDTH_DECREASE,
    PLACEBUILD_HEIGHT_DECREASE,
    ADD_INSPECT_BUILDINGS,
    SET_SHIFT_DOWN,
    HIGHLIGHT_BUILDINGS,
    HIGHLIGHT_BUILDINGS_CLEAR,
}

export type NON_THUNK_ACTIONS = (
    //builder
    ReturnType<typeof setBuildings> |
    ReturnType<typeof deleteBuildings> |
    ReturnType<typeof increasePlaceBuildWidth> |
    ReturnType<typeof increasePlaceBuildHeight> |
    ReturnType<typeof decreasePlaceBuildWidth> |
    ReturnType<typeof decreasePlaceBuildHeight> |
    //camera
    ReturnType<typeof setCameraPos> |
    ReturnType<typeof setCameraZ> |
    ReturnType<typeof setMapSize> |
    //cursor
    ReturnType<typeof setCursorPos> |
    //digger
    ReturnType<typeof setDesignateStart> |
    ReturnType<typeof setDigData> |
    //input
    ReturnType<typeof setShiftDown> |
    //inspect
    ReturnType<typeof setInspectBuildings> |
    ReturnType<typeof addInspectBuilding> |
    ReturnType<typeof addInspectBuildings> |
    ReturnType<typeof removeInspectBuildings> |
    ReturnType<typeof highlightBuildings> |
    ReturnType<typeof clearHighlightBuildings> |
    ReturnType<typeof _moveInspectedBuildings> |
    //menu
    ReturnType<typeof _setMenus> |
    //settings
    ReturnType<typeof Initialize> |
    ReturnType<typeof toggleAnimation>
);
