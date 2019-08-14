import { BUILDINGS, MENU_ITEM, Point } from "../constants";
import store from "../redux/store";
import { TileType } from "../tile";

// /**
//  * Requires CAMERA, CURSOR
//  */
// export class GameBuilder {
//     //redux
//     private cursorBuilding: boolean;
//     private cursorPosition: Point;
//     private mouseLeft: number;
//     private mouseTop: number;

//     //local
//     private buildings: {
//         [key: string]:
//         {
//             buildingKey: MENU_ITEM,
//             buildingCenter: Point,
//         },
//     };

//     constructor() {
//         store.subscribe(this.getStoreData);
//         this.buildings = {};
//     }

//     getStoreData = () => {
//         const newState = store.getState();
//         // this.camera = [newState.camera.camera[0], newState.camera.camera[1]];
//         // this.gridSize = [newState.camera.gridSize[0], newState.camera.gridSize[1]];
//         // this.mapSize = [newState.camera.mapSize[0], newState.camera.mapSize[1]];
//         this.cursorPosition = [newState.cursor.cursorPosition[0], newState.cursor.cursorPosition[1]];
//         // this.cursorRadius = newState.cursor.cursorRadius;
//         this.cursorBuilding = newState.cursor.cursorBuilding;
//         this.mouseLeft = newState.mouse.mouseLeft;
//         this.mouseTop = newState.mouse.mouseTop;
//         // this.designating = newState.designator.isDesignating;
//         // this.designationStart = newState.designator.designatorStart;
//     }

//     /**
//      * Paints the current menu item at mouse position
//      * @returns {true} if the highlighted menu item should be reset
//      */
//     paint = (highlightedMenuItem?: MENU_ITEM): boolean => {
//         if (this.cursorBuilding) {
//             return this.tryPlaceBuilding();
//         } else if (highlightedMenuItem != null && highlightedMenuItem.length > 0) {
//             // const pos = this.cursor.getPosition();
//             // const pos = [this.mouseLeft, this.mouseTop];
//             const pos = this.cursorPosition;
//             this.designateRange({ startX: pos[0], endX: pos[0], startY: pos[1], endY: pos[1] }, highlightedMenuItem);
//             this.render();
//             // switch (highlightedMenuItem) {
//             //     case MENU_ITEM.remove:
//             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
//             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Empty);
//             //             this.updateNeighborhood(pos);
//             //         }
//             //         break;
//             //     case MENU_ITEM.wall:
//             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
//             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Wall, true);
//             //             this.updateNeighborhood(pos);
//             //         }
//             //         break;
//             //     case MENU_ITEM.mine:
//             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
//             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Floor, true);
//             //             this.updateNeighborhood(pos);
//             //         }
//             //         break;
//             //     default:
//             //         return;
//             // }
//         }

//         return false;
//     }

//     // stopBuilding = () => {
//     //     this.cursor.stopBuilding();
//     //     this.designator.endDesignating();
//     //     this.render();
//     // }

//     // isBuilding = () => {
//     //     return this.cursor.isBuilding();
//     // }

//     // setCursorToBuilding = (e: MENU_ITEM) => {
//     //     const target = BUILDINGS[e];
//     //     if (target == null) {
//     //         this.cursor.stopBuilding();
//     //         return;
//     //     }

//     //     this.cursor.setBuilding(e);
//     //     this.render();
//     // }

//     /**
//      * Attempts to place a building
//      * @returns {true} if a building was placed
//      */
//     private tryPlaceBuilding = (): boolean => {
//         if (!this.cursorBuilding) {
//             return;
//         }
//         const tiles = this.cursor.getBuildingTiles();
//         for (const tile in tiles) {
//             if (!this.coordIsBuildable(tiles[tile].pos)) {
//                 // cannot place building at this location - alert user?
//                 return false;
//             }
//         }
//         const key = this.cursor.getBuildingKey();
//         const center = this.cursor.getPosition();
//         for (const tileKey of Object.keys(tiles)) {
//             const tile = tiles[tileKey];
//             this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
//             this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
//                 buildingKey: tileKey as MENU_ITEM,
//                 buildingCenter: center,
//             };
//             this.updateNeighborhood([tile.pos[0], tile.pos[1]]);
//         }
//         this.cursor.stopBuilding();
//         this.designator.endDesignating();
//         this.render();
//         return true;
//     }
// }
