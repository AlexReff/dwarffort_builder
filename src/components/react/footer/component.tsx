import { Component, h } from "preact";
import { IFooterProps } from ".";
import { getQuickfortCsv } from "../../serialize";

export class Footer extends Component<IFooterProps> {
    quickfortUrl: string;
    lastQuickfortValue: string;

    render = (props: IFooterProps, state: any) => {
        return (
            <footer id="footer">
                <div class="inner">
                    {this.getQuickfortLink()}
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
            this.lastQuickfortValue = csv;
        }

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
