import { Component, h } from "preact";
import { connect } from "react-redux";
import { TILE_H, TILE_URL, TILE_W } from "../constants";
import { toggleDebugMode } from "../redux/settings/actions";
import { ReduxState } from "../redux/store";

interface IDebugMenuProps {
    debugMode: boolean;
}

interface IDebugMenuState {
    mouseLeft: number;
    mouseTop: number;
    num: number;
    // highlightedTile: Tile;
}

const mapStateToProps = (state: ReduxState) => ({
    debugMode: state.settings.debugMode,
    // currentMenu: state.menu.currentSubmenu,
    // currentMenuItem: state.menu.currentMenuItem,
    // inspectedBuildings: state.inspect.inspectedBuildings,
    // buildingTiles: state.building.buildingTiles,
    // terrainTiles: state.digger.terrainTiles,
    // cameraZ: state.camera.cameraZ,
});

const mapDispatchToProps = (dispatch) => ({
    toggleDebugMode: () => dispatch(toggleDebugMode()),
    // selectMenuItem: (id) => dispatch(selectMenu(id)),
    // removeInspectBuilding: (item) => dispatch(removeInspectBuilding(item)),
    // setInspectBuildings: (items) => dispatch(setInspectBuildings(items)),
    // inspectTileAtMapCoord: (coord, add) => dispatch(inspectRequestAtMapCoord(coord, add)),
});

class DebugMenu extends Component<IDebugMenuProps, IDebugMenuState> {
    state = {
        mouseLeft: 0,
        mouseTop: 0,
        num: 0,
        highlightedTile: null,
    };

    private imgElement: HTMLImageElement;

    componentDidMount = () => {
        this.imgElement = document.getElementById("debug-sprite-img") as HTMLImageElement;
        this.imgElement.addEventListener("mousemove", this.handleSpriteMouseover);
    }

    render = (props: IDebugMenuProps, state: IDebugMenuState) => {
        return (
            <div id="debug" class={props.debugMode ? "active" : null}>
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
        const iNum = (pos[0] / TILE_W) + pos[1];
        this.setState({
            mouseLeft: pos[0],
            mouseTop: pos[1],
            num: iNum,
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
            <div id="debug-menu" class={this.props.debugMode ? "active" : null}>
                <div id="debug-sprite">
                    <img id="debug-sprite-img" src={TILE_URL} />
                    <div id="debug-sprite-text">{`${this.state.mouseLeft}, ${this.state.mouseTop} - ${this.state.num}`}</div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DebugMenu);
