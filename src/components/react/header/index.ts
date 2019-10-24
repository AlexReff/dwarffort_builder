import { connect } from "react-redux";
import {
    ICameraState,
    mapDispatchToProps,
    mapStateToProps,
} from "../../redux";
import { Header } from "./component";

export interface IHeaderState {
    zLevelChanged: boolean;
}

class HeaderReduxProps {
    constructor(
        public cameraZ: ICameraState["cameraZ"] = null,
    ) { }
}

const HeaderFuncs = {
    //
};

export type IHeaderProps = HeaderReduxProps & typeof HeaderFuncs;

const reduxProps = mapStateToProps(Object.keys(new HeaderReduxProps()));

const reduxFuncs = mapDispatchToProps(Object.values(HeaderFuncs));

export default connect(reduxProps, reduxFuncs)(Header);
