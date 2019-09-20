import { Component, h } from "preact";
import { connect } from "react-redux";
import { ICameraState } from "./redux/camera/reducer";
import { ReduxState } from "./redux/store";

interface IHeaderProps {
    cameraZ: ICameraState["cameraZ"];
}

const mapStateToProps = (state: ReduxState) => ({
    cameraZ: state.camera.cameraZ,
});

interface IHeaderState {
    zLevelChanged: boolean;
}

class Header extends Component<IHeaderProps, IHeaderState> {
    constructor(props: IHeaderProps) {
        super();
    }

    render = (props: IHeaderProps, state: IHeaderState) => {
        if (props.cameraZ !== 0 && !state.zLevelChanged) {
            this.setState({
                zLevelChanged: true,
            });
        }
        return (
            <div class="header_info">
                {state.zLevelChanged ? (
                    <div class="zlevel">
                        Z:{props.cameraZ}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default connect(mapStateToProps/*, mapDispatchToProps*/)(Header);
