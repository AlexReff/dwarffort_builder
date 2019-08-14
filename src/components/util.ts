// import { IGridRange, Point } from "./constants";
// import store, { getAllStoreData } from "./redux/store";
// import { TileType } from "./tile";

// class _Util {
//     camera: Point = null;
//     gridSize: Point = null;
//     animationToggle: boolean = null;
//     cursorPosition: Point = null;
//     isDesignating: boolean = null;
//     designatorStart: Point = null;
//     strictMode: boolean = null;
//     building: boolean = null;
//     buildingRange: Point[] = null;

//     constructor() {
//         store.subscribe(this.getStoreData);
//         this.getStoreData();
//     }

//     getStoreData = () => {
//         getAllStoreData(this, store);
//     }

//     /**
//      * Converts a GRID coordinate to a MAP coordinate
//      */
//     getMapCoord = (coord: Point): Point => {
//         if (coord == null || this.camera == null || this.camera.length !== 2) {
//             return null;
//         }
//         return [
//             coord[0] + this.camera[0],
//             coord[1] + this.camera[1],
//         ];
//     }

//     /**
//      * Converts a MAP coordinate to a GRID coordinate
//      */
//     getGridCoord = (coord: Point): Point => {
//         if (coord == null ||
//             coord.length !== 2 ||
//             this.camera == null ||
//             this.camera.length !== 2 ||
//             coord[0] < this.camera[0] ||
//             coord[1] < this.camera[1] ||
//             coord[0] >= this.camera[0] + this.gridSize[0] ||
//             coord[1] >= this.camera[1] + this.gridSize[1]) {
//             return null;
//         }
//         return [
//             coord[0] - this.camera[0],
//             coord[1] - this.camera[1],
//         ];
//     }

//     /**
//      * Returns Map coordinate position
//      */
//     getMousePosition = (e: MouseEvent | TouchEvent | { clientX: number; clientY: number; }) => {
//         // const gridCoord = this.display.eventToPosition(e);
//         const gridCoord = [0, 0] as Point;
//         return this.getMapCoord(gridCoord);
//     }

//     // getTileAtMouse = (clientX: number, clientY: number): Tile => {
//     //     const coord = this.getMousePosition({ clientX, clientY });
//     //     // const coord = this.getMapCoord(mouse);
//     //     return this.gameGrid[this.zLevel][coord[0]][coord[1]];
//     // }

//     isTileAnimating = (pos: Point): boolean => {
//         if (!this.animationToggle) {
//             return false;
//         }
//         return this.coordIsDesignating(pos);
//     }

//     coordIsDesignating = (pos: Point): boolean => {
//         if (this.isDesignating) {
//             //const cursor = this.cursor.getPosition();
//             // const cursor = this.cursorPosition;
//             // const bounds = this.designator.getRange(cursor);
//             const bounds = this.getDesignatorRange();
//             return pos[0] >= bounds.startX && pos[1] >= bounds.startY && pos[0] <= bounds.endX && pos[1] <= bounds.endY;
//         }

//         return false;
//     }

//     getDesignatorRange = (pos?: Point): IGridRange => {
//         const coord = pos ? pos : this.cursorPosition;
//         const startX = Math.min(this.designatorStart[0], coord[0]);
//         const endX = Math.max(this.designatorStart[0], coord[0]);
//         const startY = Math.min(this.designatorStart[1], coord[1]);
//         const endY = Math.max(this.designatorStart[1], coord[1]);

//         return {
//             startX,
//             endX,
//             startY,
//             endY,
//         };
//     }
// }

// const Util = new _Util();
// export default Util;
