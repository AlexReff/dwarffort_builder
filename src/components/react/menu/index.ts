import { connect } from "react-redux";
import {
    clearHighlightBuildings,
    deleteBuildings,
    highlightBuildings,
    IBuildingState,
    ICameraState,
    IDiggerState,
    IInputState,
    IInspectState,
    IMenuState,
    inspectAllOfType,
    mapDispatchToProps,
    mapStateToProps,
    removeInspectBuilding,
    selectMenu,
    setInspectBuildings,
} from "../../redux/";
import { Menu } from "./component";

export interface IGameMenuState {
    expandedToolbarItems: string[];
}

class MenuReduxProps {
    constructor(
        public currentSubmenu: IMenuState["currentSubmenu"] = null,
        public currentMenuItem: IMenuState["currentMenuItem"] = null,
        public inputState: IInputState["inputState"] = null,
        public buildingTiles: IBuildingState["buildingTiles"] = null,
        public inspectedBuildings: IInspectState["inspectedBuildings"] = null,
        public terrainTiles: IDiggerState["terrainTiles"] = null,
        public cameraZ: ICameraState["cameraZ"] = null,
        public shiftDown: IInputState["shiftDown"] = null,
    ) { }
}

const MenuFuncs = {
    selectMenu,
    removeInspectBuilding,
    setInspectBuildings,
    deleteBuildings,
    inspectAllOfType,
    highlightBuildings,
    clearHighlightBuildings,
};

export type IMenuProps = MenuReduxProps & typeof MenuFuncs;

const reduxProps = mapStateToProps(Object.keys(new MenuReduxProps()));

const reduxFuncs = mapDispatchToProps(Object.values(MenuFuncs));

export default connect(reduxProps, reduxFuncs)(Menu);
