import { Component, h } from "preact";
import { IHeaderProps, IHeaderState } from ".";

export class Header extends Component<IHeaderProps, IHeaderState> {
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
