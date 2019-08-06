import { Point, TILE_H, TILE_MAP, TILE_W } from "../constants";
import Display from "../rot/display";

// export class GameRender {

//     constructor() {
//         // this.init();
//     }

//     /**
//      * Renders the correct tile at the given coord
//      * @param coord MAP coordinate to render
//      */
//     protected renderPosition = (coord: Point) => {
//         const gridCoord = this.getGridCoord(coord);
//         let parms = null;
//         if (this.isTileAnimating(coord)) {
//             parms = this.designator.getDrawData(coord);
//             // this.display.draw.apply(this.display, parms);
//         } else {
//             const cursorPos = this.cursor.getPosition();
//             if (coord[0] === cursorPos[0] && coord[1] === cursorPos[1] && this.designator.isDesignating()) {
//                 //parms = this.designator.getDrawData(gridCoord);
//                 parms = this.cursor.getDrawData(coord, !this.coordIsBuildable(coord));
//             // if (this.cursor.coordIsCursor(coord)) {
//             //     // render just cursor
//             //     parms = this.cursor.getDrawData(coord, !this.coordIsBuildable(coord));
//             } else {
//                 parms = this.gameGrid[this.zLevel][coord[0]][coord[1]].getDrawData(coord);
//             }
//             // this.parseParms(parms);
//             // this.display.draw.apply(this.display, parms);
//         }

//         parms[0] = gridCoord[0];
//         parms[1] = gridCoord[1];
//         this.display.draw.apply(this.display, parms);
//     }

//     /**
//      * Render the entire grid
//      */
//     protected render = () => {
//         for (let x = this.camera[0]; x < this.camera[0] + this.gridSize[0]; x++) {
//             for (let y = this.camera[1]; y < this.camera[1] + this.gridSize[1]; y++) {
//                 this.renderPosition([x, y]);
//             }
//         }
//         this.dirtyTiles = [];
//     }

//     /**
//      * Re-draws only 'dirty' tiles
//      */
//     protected renderDirty = () => {
//         if (this.dirtyTiles == null || this.dirtyTiles.length === 0) {
//             return;
//         }
//         const dirty = new Array<Point>();
//         while (this.dirtyTiles.length > 0) {
//             dirty.push(this.dirtyTiles.pop());
//         }
//         for (const coord of dirty) {
//             this.renderPosition(coord);
//         }
//     }

//     protected renderCursor = () => {
//         for (const i of this.cursor.getRange()) {
//             this.renderPosition(i);
//         }
//     }

//     // protected renderDesignated = () => {
//     //     if (this.designatorTiles == null || this.designatorTiles.length === 0) {
//     //         return;
//     //     }
//     //     for (const coord of this.designatorTiles) {
//     //         this.renderPosition(coord);
//     //     }
//     // }
// }
