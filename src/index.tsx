/// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
import { h, render, Component } from 'preact';

require('./css/index.scss');

// function Start() {
//     PIXI.utils.skipHello();
//     const app = new PIXI.Application();
//     document.getElementById("canvas").appendChild(app.view);
//     /*
//         Draw a 2d grid on the canvas
//         Add Mouse support for hover/click on tiles
//         Add drag support to tilegrid
//         Add sidebar with build options (+hotkeys?)
//         Ability to click on sidebar item and modify cursor hover/click behavior
//         Add drag behavior option - rectangular select or paint (select rectangular area to modify/move/clear or 'paint' - select every item the cursor directly moves over)
//         Add arrow key support + keyboard tile cursor
//         Add stockpiles, workshops, walls, multiple z-levels

        
//         Add google analytics + simple text ads before public release?
//     */
// }

// Start();

class FortressDesigner extends Component {
    private timer: any;
    //PIXI.utils.skipHello();
    //const app = new PIXI.Application();
    //document.getElementById("canvas").appendChild(app.view);

    constructor() {
        super();
        // set initial time:
        this.setState({ time: Date.now() });
    }

    componentDidMount() {
        // update time every second
        this.timer = setInterval(() => {
            this.setState({ time: Date.now() });
        }, 1000);
    }

    componentWillUnmount() {
        // stop when not renderable
        clearInterval(this.timer);
    }

    render(props, state) {
        let time = new Date(state.time).toLocaleTimeString();
        return <span>{ time }</span>;
    }
}

render(<FortressDesigner />, document.getElementById("canvas"));
