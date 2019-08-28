import * as _ from "lodash";
import { Component, h } from "preact";
import { connect } from "react-redux";
import { ICameraState } from "./redux/camera/reducer";
import { ReduxState } from "./redux/store";

interface IHeaderProps {
    zLevel: ICameraState["zLevel"];
}

const mapStateToProps = (state: ReduxState) => ({
    zLevel: state.camera.zLevel,
});

interface IHeaderState {
    zLevelChanged: boolean;
}

class Header extends Component<IHeaderProps, IHeaderState> {
    constructor(props: IHeaderProps) {
        super();
    }

    componentDidMount = () => {
        // window.addEventListener("keydown", this.handleKeyDown);
        // window.addEventListener("keyup", this.handleKeyUp);
    }

    render = (props: IHeaderProps, state: IHeaderState) => {
        if (props.zLevel !== 0 && !state.zLevelChanged) {
            this.setState({
                zLevelChanged: true,
            });
        }
        return (
            <div class="header_info">
                {state.zLevelChanged ? (
                    <div class="zlevel">
                        Z:{props.zLevel}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default connect(mapStateToProps/*, mapDispatchToProps*/)(Header);
