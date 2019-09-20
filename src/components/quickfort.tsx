import * as _ from "lodash";
import { Component, h } from "preact";
import { connect } from "react-redux";
import { ICameraState } from "./redux/camera/reducer";
import { ReduxState } from "./redux/store";

interface IQuickfortProps {
    cameraZ: ICameraState["cameraZ"];
}

const mapStateToProps = (state: ReduxState) => ({
    cameraZ: state.camera.cameraZ,
});

interface IQuickfortState {
    zLevelChanged: boolean;
}

class Quickfort extends Component<IQuickfortProps, IQuickfortState> {
    constructor(props: IQuickfortProps) {
        super();
    }

    componentDidMount = () => {
        // window.addEventListener("keydown", this.handleKeyDown);
        // window.addEventListener("keyup", this.handleKeyUp);
    }

    // tslint:disable-next-line: member-ordering
    tableToExcel: (table: HTMLElement | string, name: string) => void = (() => {
        const uri = "data:application/vnd.ms-excel;base64,";
        const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
        const base64 = (s) => window.btoa(unescape(encodeURIComponent(s)));
        const format = (s, c) => s.replace(/{(\w+)}/g, (m, p) => c[p]);
        return (table, name) => {
            if (!table.nodeType) { table = document.getElementById(table); }
            const ctx = { worksheet: name || "Worksheet", table: table.innerHTML };
            window.location.href = uri + base64(format(template, ctx));
        };
    })();

    render = (props: IQuickfortProps, state: IQuickfortState) => {
        return (
            <div class="quickfort_table">
                Populate this table &amp; try tableToExcel() on it
            </div>
        );
    }
}

export default connect(mapStateToProps/*, mapDispatchToProps*/)(Quickfort);
