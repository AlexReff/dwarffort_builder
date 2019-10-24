import { connect } from "react-redux";
import {
    IBuildingState,
    ICameraState,
    IDiggerState,
    IInputState,
    IInspectState,
    IMenuState,
    mapDispatchToProps,
    mapStateToProps,
} from "../../redux";
import { Footer } from "./component";

class FooterReduxProps {
    constructor(
        public currentMenu: IMenuState["currentSubmenu"] = null,
        public currentMenuItem: IMenuState["currentMenuItem"] = null,
        public inputState: IInputState["inputState"] = null,
        public buildingTiles: IBuildingState["buildingTiles"] = null,
        public terrainTiles: IDiggerState["terrainTiles"] = null,
        public inspectedBuildings: IInspectState["inspectedBuildings"] = null,
        public cameraZ: ICameraState["cameraZ"] = null,
    ) { }
}

export const FooterFuncs = {
    //
};

export type IFooterProps = FooterReduxProps & typeof FooterFuncs;

const reduxProps = mapStateToProps(Object.keys(new FooterReduxProps()));

const reduxFuncs = mapDispatchToProps(Object.values(FooterFuncs));

export default connect(reduxProps, reduxFuncs)(Footer);
