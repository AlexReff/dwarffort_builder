import * as _ from "lodash";
import { Component, h } from "preact";
import { TILE_H, TILE_W, TILE_URL } from "./constants";
import { Tile } from "./tile";

interface IDebugMenuProps {
    isActive: boolean;
}

interface IDebugMenuState {
    mouseLeft: number;
    mouseTop: number;
    highlightedTile: Tile;
}

class DebugMenu extends Component<IDebugMenuProps, IDebugMenuState> {
    state = {
        mouseLeft: 0,
        mouseTop: 0,
        highlightedTile: null,
    };

    private imgElement: HTMLImageElement;

    componentDidMount() {
        this.imgElement = document.getElementById("debug-sprite-img") as HTMLImageElement;
        this.imgElement.addEventListener("mousemove", this.handleSpriteMouseover);
    }

    render(props: IDebugMenuProps, state: IDebugMenuState) {
        return (
            <div id="debug" class={props.isActive ? "active" : null}>
                {this.renderSpriteSheet()}
            </div>
        );
    }

    private handleSpriteMouseover = (e: MouseEvent) => {
        const bounds = this.imgElement.getBoundingClientRect();
        const pos = [
            e.clientX - bounds.left,
            e.clientY - bounds.top,
        ];
        pos[0] = pos[0] - (pos[0] % TILE_W);
        pos[1] = pos[1] - (pos[1] % TILE_H);
        this.setState({
            mouseLeft: pos[0],
            mouseTop: pos[1],
        });
    }

    private renderFontSheet = () => {
        const stack = [];
        const stf = [];
        for (let i = 0; i < 260; i++) {
            stf.push(
                <div class="row"><div>{i + ": "}</div><div>{String.fromCharCode(i)}</div></div>,
            );
        }
        stack.push((
            <table class="chars">{stf}</table>
        ));
        return stack;
    }

    private renderSpriteSheet = () => {
        return (
            <div id="debug-menu" class={this.props.isActive ? "active" : null}>
                <div id="debug-sprite">
                    <img id="debug-sprite-img" src={TILE_URL} />
                    <div id="debug-sprite-text">{`${this.state.mouseLeft}, ${this.state.mouseTop}`}</div>
                </div>
            </div>
        );
    }
}

export { DebugMenu };
