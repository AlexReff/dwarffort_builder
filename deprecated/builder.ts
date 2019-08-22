// import { BUILDINGS, CURSOR_BEHAVIOR, MENU_ITEM, Point } from "../src/components/constants";
// import store, { IFlatReduxState } from "../src/components/redux/store";
// import { Tile, TileType } from "../src/components/tile";

// export class GameBuilder implements IFlatReduxState {
//     animationToggle: boolean;
//     camera: [number, number];
//     gridSize: [number, number];
//     mapSize: [number, number];
//     cursorVisible: boolean;
//     cursorDiameter: number;
//     isDesignating: boolean;
//     designatorStart: [number, number];
//     highlighting: boolean;
//     highlightingStart: [number, number];
//     currentMenu: string;
//     inspecting: boolean;
//     mouseOverGrid: boolean;
//     leftMouseDown: boolean;
//     mouseMapCoord: [number, number];
//     mouseTile: Tile;
//     cursorMode: CURSOR_BEHAVIOR;
//     gameGrid: { [key: number]: Tile[][] };
//     cursorBuilding: boolean;
//     currentMenuItem: MENU_ITEM;
//     zLevel: number;
//     cursorPosition: Point;
//     strictMode: boolean;
//     cursorRadius: number;

//     // /**
//     //  * Attempts to place a building
//     //  * @returns {true} if a building was placed
//     //  */
//     // tryPlaceBuilding = (): boolean => {
//     //     if (!this.cursorBuilding) {
//     //         return;
//     //     }
//     //     const tiles = BUILDINGS[this.currentMenuItem].tiles;

//     //     //check if we can build here
//     //     for (let y = 0; y < tiles.length; y++) {
//     //         for (let x = 0; x < tiles[0].length; x++) {
//     //             const targetTile = this.gameGrid[this.zLevel][this.cursorPosition[0] - this.cursorRadius + x][this.cursorPosition[1] - this.cursorRadius + y];
//     //             if (!targetTile.isBuildable(this.strictMode)) {
//     //                 return false;
//     //             }
//     //         }
//     //     }
//     //     for (let y = 0; y < tiles.length; y++) {
//     //         for (let x = 0; x < tiles[0].length; x++) {
//     //             const targetTile = this.gameGrid[this.zLevel][this.cursorPosition[0] - this.cursorRadius + x][this.cursorPosition[1] - this.cursorRadius + y];
//     //             targetTile.setBuilding(this.currentMenuItem, tiles[y][x]);
//     //             // this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
//     //             //     buildingKey: tileKey as MENU_ITEM,
//     //             //     buildingCenter: center,
//     //             // };
//     //         }
//     //     }
//     //     // for (const tileKey of Object.keys(tiles)) {
//     //     //     const tile = tiles[tileKey];
//     //     //     this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
//     //     //     this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
//     //     //         buildingKey: tileKey as MENU_ITEM,
//     //     //         buildingCenter: center,
//     //     //     };
//     //     //     this.updateNeighborhood([tile.pos[0], tile.pos[1]]);
//     //     // }
//     //     // this.render();
//     //     return true;
//     // }
// }

// // /**
// //  * Requires CAMERA, CURSOR
// //  */
// // export class GameBuilder {
// //     //redux
// //     private cursorBuilding: boolean;
// //     private cursorPosition: Point;
// //     private mouseLeft: number;
// //     private mouseTop: number;

// //     //local
// //     private buildings: {
// //         [key: string]:
// //         {
// //             buildingKey: MENU_ITEM,
// //             buildingCenter: Point,
// //         },
// //     };

// //     constructor() {
// //         store.subscribe(this.getStoreData);
// //         this.buildings = {};
// //     }

// //     getStoreData = () => {
// //         const newState = store.getState();
// //         // this.camera = [newState.camera.camera[0], newState.camera.camera[1]];
// //         // this.gridSize = [newState.camera.gridSize[0], newState.camera.gridSize[1]];
// //         // this.mapSize = [newState.camera.mapSize[0], newState.camera.mapSize[1]];
// //         this.cursorPosition = [newState.cursor.cursorPosition[0], newState.cursor.cursorPosition[1]];
// //         // this.cursorRadius = newState.cursor.cursorRadius;
// //         this.cursorBuilding = newState.cursor.cursorBuilding;
// //         this.mouseLeft = newState.mouse.mouseLeft;
// //         this.mouseTop = newState.mouse.mouseTop;
// //         // this.designating = newState.designator.isDesignating;
// //         // this.designationStart = newState.designator.designatorStart;
// //     }

// //     /**
// //      * Paints the current menu item at mouse position
// //      * @returns {true} if the highlighted menu item should be reset
// //      */
// //     paint = (highlightedMenuItem?: MENU_ITEM): boolean => {
// //         if (this.cursorBuilding) {
// //             return this.tryPlaceBuilding();
// //         } else if (highlightedMenuItem != null && highlightedMenuItem.length > 0) {
// //             // const pos = this.cursor.getPosition();
// //             // const pos = [this.mouseLeft, this.mouseTop];
// //             const pos = this.cursorPosition;
// //             this.designateRange({ startX: pos[0], endX: pos[0], startY: pos[1], endY: pos[1] }, highlightedMenuItem);
// //             this.render();
// //             // switch (highlightedMenuItem) {
// //             //     case MENU_ITEM.remove:
// //             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
// //             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Empty);
// //             //             this.updateNeighborhood(pos);
// //             //         }
// //             //         break;
// //             //     case MENU_ITEM.wall:
// //             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
// //             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Wall, true);
// //             //             this.updateNeighborhood(pos);
// //             //         }
// //             //         break;
// //             //     case MENU_ITEM.mine:
// //             //         if (!this.gameGrid[this.zLevel][pos[0]][pos[1]].isBuilding()) {
// //             //             this.gameGrid[this.zLevel][pos[0]][pos[1]].setType(TileType.Floor, true);
// //             //             this.updateNeighborhood(pos);
// //             //         }
// //             //         break;
// //             //     default:
// //             //         return;
// //             // }
// //         }

// //         return false;
// //     }

// //     // stopBuilding = () => {
// //     //     this.cursor.stopBuilding();
// //     //     this.designator.endDesignating();
// //     //     this.render();
// //     // }

// //     // isBuilding = () => {
// //     //     return this.cursor.isBuilding();
// //     // }

// //     // setCursorToBuilding = (e: MENU_ITEM) => {
// //     //     const target = BUILDINGS[e];
// //     //     if (target == null) {
// //     //         this.cursor.stopBuilding();
// //     //         return;
// //     //     }

// //     //     this.cursor.setBuilding(e);
// //     //     this.render();
// //     // }

// //     /**
// //      * Attempts to place a building
// //      * @returns {true} if a building was placed
// //      */
// //     private tryPlaceBuilding = (): boolean => {
// //         if (!this.cursorBuilding) {
// //             return;
// //         }
// //         const tiles = this.cursor.getBuildingTiles();
// //         for (const tile in tiles) {
// //             if (!this.coordIsBuildable(tiles[tile].pos)) {
// //                 // cannot place building at this location - alert user?
// //                 return false;
// //             }
// //         }
// //         const key = this.cursor.getBuildingKey();
// //         const center = this.cursor.getPosition();
// //         for (const tileKey of Object.keys(tiles)) {
// //             const tile = tiles[tileKey];
// //             this.gameGrid[this.zLevel][tile.pos[0]][tile.pos[1]].setBuilding(key, tile.tile);
// //             this.buildings[`${tile.pos[0]}:${tile.pos[1]}`] = {
// //                 buildingKey: tileKey as MENU_ITEM,
// //                 buildingCenter: center,
// //             };
// //             this.updateNeighborhood([tile.pos[0], tile.pos[1]]);
// //         }
// //         this.cursor.stopBuilding();
// //         this.designator.endDesignating();
// //         this.render();
// //         return true;
// //     }
// // }
