import { Component, h } from "preact";
import { connect } from "react-redux";

class GameHighlighter extends Component {
    componentDidMount = () => {
        // window.addEventListener("mousemove", this.handleMouseMove);
    }

    // handleMouseMove = (e: MouseEvent | TouchEvent) => {
    //     //
    // }

    getHighlighterStyle = () => {
        // if (!this.props.highlighting ||
        //     !this.headerElement ||
        //     !this.canvasElement ||
        //     !this.props.mouseOverGrid ||
        //     this.props.mouseLeft == null ||
        //     this.props.mouseTop == null) {
        //     return {
        //         display: "none",
        //     };
        // }
        // const targetPos = this.game.getMousePosition({ clientX: this.state.mouseLeft, clientY: this.state.mouseTop });
        // const bounds = this.canvasElement.getBoundingClientRect();
        // const camera = this.game.getCamera();
        // const width = TILE_W * (1 + Math.abs(targetPos[0] - this.state.highlightingStart[0]));
        // const height = TILE_H * (1 + Math.abs(targetPos[1] - this.state.highlightingStart[1]));

        // const left = bounds.left + TILE_W * (Math.min(targetPos[0], this.state.highlightingStart[0]) - camera[0]);
        // const top = bounds.top + TILE_H * (Math.min(targetPos[1], this.state.highlightingStart[1]) - camera[1]);
        // return {
        //     width: `${width}px`,
        //     height: `${height}px`,
        //     left,
        //     top,
        // };
        return {};
    }

    render = (props, state) => {
        return (
            <div id="highlighter" class={props.highlighting ? "active" : null} style={this.getHighlighterStyle()}></div>
        );
    }
}

export default connect(
    null,
    {},
)(GameHighlighter);
