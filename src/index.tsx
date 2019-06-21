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
    private pixiApp: PIXI.Application;
    //PIXI.utils.skipHello();
    //const app = new PIXI.Application();
    //document.getElementById("canvas").appendChild(app.view);

    constructor() {
        super();
        PIXI.utils.skipHello();
        //this.setState({ time: Date.now() });
    }

    componentDidMount() {
        let canvasTarget = document.getElementById("canvas");
        this.pixiApp = new PIXI.Application({
            width: canvasTarget.clientWidth,
            height: canvasTarget.scrollHeight,
            //backgroundColor: 0x1099bb, 
            resolution: window.devicePixelRatio || 1
        });
        
        canvasTarget.appendChild(this.pixiApp.view);
        
        const container = new PIXI.Container();
        container.x = this.pixiApp.screen.width / 2;
        container.y = this.pixiApp.screen.height / 2;

        this.pixiApp.stage.addChild(container);
        // this.pixiApp.ticker.add((delta) => {
        //     // use delta to create frame-independent transform
        //     //container.rotation -= 0.01 * delta;
        // });
    }

    componentWillUnmount() {
        // stop when not renderable
        // clearInterval(this.timer);
    }

    render(props, state) {
        // let time = new Date(state.time).toLocaleTimeString();
        // return <span>{ time }</span>;
        return ( 
            <div>Menu Will Go Here</div>
        );
    }
}

render(<FortressDesigner />, document.getElementById("menu"));
