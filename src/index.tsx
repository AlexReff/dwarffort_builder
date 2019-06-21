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
    private tileMap: PIXI.Graphics;

    private tileSize: number = 32;
    private grid_offset_x: number = 1;
    private grid_offset_y: number = 1;

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

        this.tileMap = new PIXI.Graphics();
        this.tileMap.lineStyle(2, 0xFFFFFF, 1);
        this.pixiApp.stage.addChild(this.tileMap);

        let xLimit = (canvasTarget.clientWidth / this.tileSize) + 1;
        let yLimit = (canvasTarget.clientHeight / this.tileSize) + 1;
        for (let x = 0; x < xLimit; x++) {
            for (let y = 0; y < yLimit; y++) {
                this.tileMap.drawRect(this.grid_offset_x + this.tileSize * x, this.grid_offset_y + this.tileSize * y, this.tileSize, this.tileSize);
            }
        }

        // this.pixiApp.ticker.add((delta) => {
        //     //
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
