import { Component, h } from "preact";
import { connect } from "react-redux";
import { IBuildingState } from "../redux/building/reducer";
import { ICameraState } from "../redux/camera/reducer";
import { IDiggerState } from "../redux/digger/reducer";
import { IInputState } from "../redux/input/reducer";
import { IInspectState } from "../redux/inspect/reducer";
import { IMenuState } from "../redux/menu/reducer";
import { ReduxState } from "../redux/store";
import { getQuickfortCsv } from "../serialize";

interface IFooterProps {
    currentMenu: IMenuState["currentSubmenu"];
    currentMenuItem: IMenuState["currentMenuItem"];
    inputState: IInputState["inputState"];
    buildingTiles: IBuildingState["buildingTiles"];
    terrainTiles: IDiggerState["terrainTiles"];
    inspectedBuildings: IInspectState["inspectedBuildings"];
    cameraZ: ICameraState["cameraZ"];

    // selectMenuItem: (id: string) => void;
}

const mapStateToProps = (state: ReduxState) => ({
    currentMenu: state.menu.currentSubmenu,
    currentMenuItem: state.menu.currentMenuItem,
    inputState: state.input.inputState,
    inspectedBuildings: state.inspect.inspectedBuildings,
    buildingTiles: state.building.buildingTiles,
    terrainTiles: state.digger.terrainTiles,
    cameraZ: state.camera.cameraZ,
});

const mapDispatchToProps = (dispatch) => ({
    // selectMenuItem: (id) => dispatch(selectMenu(id)),
});

class Footer extends Component<IFooterProps> {
    quickfortUrl: string;
    lastQuickfortValue: string;

    render = (props: IFooterProps, state) => {
        return (
            <footer id="footer">
                <div class="inner">
                    {this.getQuickfortLink()}
                    {/* { this.getPermaLink() } */}
                    {/* <div class="data-cursor">Cursor: {this.renderFooterCursor()}</div>
                    <div class="data-mouse">Mouse: {this.renderFooterMouse()}</div> */}
                </div>
            </footer>
        );
    }

    getQuickfortLink = () => {
        if (Object.keys(this.props.terrainTiles).length === 0) {
            return "";
        }

        const csv = getQuickfortCsv();
        if (csv !== this.lastQuickfortValue) {
            const csvFile = new Blob([csv], { type: "text/csv" });
            if (this.quickfortUrl) {
                window.URL.revokeObjectURL(this.quickfortUrl);
            }
            this.quickfortUrl = window.URL.createObjectURL(csvFile);
        }

        this.lastQuickfortValue = csv;

        return (
            <a href={this.quickfortUrl} target="_blank" download="fortd.csv">Download Quickfort CSV</a>
        );
    }

    /*
    getPermaLink = () => {
        const emptyTerrain = Object.keys(this.props.terrainTiles).length === 0 || !Object.keys(this.props.terrainTiles).some((m) => Object.keys(this.props.terrainTiles[m]).length !== 0);
        const emptyBuildings = Object.keys(this.props.buildingTiles).length === 0 || !Object.keys(this.props.buildingTiles).some((m) => Object.keys(this.props.buildingTiles[m]).length !== 0);

        if (emptyTerrain && emptyBuildings) {
            return "";
        }

        //const terrain = window.btoa(JSON.stringify(this.props.terrainTiles));
        //

        //"0=[]&"
        const floors = Object.keys(this.props.terrainTiles).map((floor) => {
            //"z,x,y:type|"
            const tiles = Object.keys(this.props.terrainTiles[floor]).map((val) => {
                const tile = this.props.terrainTiles[floor][val];
                return `${tile.posX},${tile.posY}:${tile.type.toString()}`;
            });
            return `${floor}=${tiles.join("|")}`;
        });

        const terrain = window.btoa(floors.join("&"));

        let url = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?t=${terrain}`;

        if (!emptyBuildings) {
            const buildings = window.btoa(JSON.stringify(this.props.buildingTiles));
            url += `&b=${buildings}`;
        }

        return (
            <a href={url}>Permalink</a>
        );
    }
    */
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
