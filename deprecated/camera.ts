// import { Point } from "../constants";
// import { moveCamera, zLevelDown, zLevelGoto, zLevelUp } from "../redux/camera/actions";
// import store, { getAllStoreData, getUpdatedStoreData } from "../redux/store";

// export class GameCamera {
//     //camera
//     camera: Point = null;
//     gridSize: Point = null;
//     mapSize: Point = null;

//     //cursor
//     cursorRadius: number = null;
//     cursorPosition: Point = null;

//     constructor() {
//         store.subscribe(this.getStoreData);
//         this.getStoreData();
//     }

//     getStoreData = () => {
//         const prevState = getUpdatedStoreData(this, store);
//         if (prevState.cursorPosition != null ||
//             prevState.mapSize != null ||
//             prevState.gridSize != null) {
//             this.updateCameraPosition();
//         }
//     }

//     // resetCamera = () => {
//     //     store.dispatch(CameraGoto([
//     //         Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
//     //         Math.floor((this.mapSize[1] - this.gridSize[1]) / 2),
//     //     ]));
//     // }

//     // getCamera = () => {
//     //     return [this.camera[0], this.camera[1]];
//     // }

//     updateCameraPosition = () => {
//         if (this.cursorPosition == null || this.mapSize == null) {
//             return;
//         }
//         //makes sure the CURSOR is being rendered in the grid
//         const pos = this.cursorPosition.slice();
//         if (pos[0] < 0 || pos[1] < 0 ||
//             pos[0] > this.mapSize[0] ||
//             pos[1] > this.mapSize[1]) {
//             return;
//         }
//         const radius = this.cursorRadius;
//         const newPos = this.camera.slice() as Point;
//         if (pos[0] - radius < this.camera[0]) {
//             //MOVE NORTH
//             const dist = Math.ceil((this.camera[0] - pos[0] + radius) / 10) * 10;
//             const toMove = Math.max(0, this.camera[0] - dist);
//             newPos[0] = toMove;
//         } else if (pos[0] + radius >= this.camera[0] + this.gridSize[0]) {
//             //MOVE SOUTH
//             const dist = Math.ceil((pos[0] + radius - this.camera[0] - (this.gridSize[0] - 1)) / 10) * 10;
//             const toMove = Math.min(this.mapSize[0] - this.gridSize[0], this.camera[0] + dist);
//             newPos[0] = toMove;
//         }

//         if (pos[1] - radius < this.camera[1]) {
//             //MOVE WEST
//             const dist = Math.ceil((this.camera[1] - pos[1] + radius) / 10) * 10;
//             const toMove = Math.max(0, this.camera[1] - dist);
//             newPos[1] = toMove;
//         } else if (pos[1] + radius >= this.camera[1] + this.gridSize[1]) {
//             //MOVE EAST
//             const dist = Math.ceil((pos[1] + radius - this.camera[1] - (this.gridSize[1] - 1)) / 10) * 10;
//             const toMove = Math.min(this.mapSize[1] - this.gridSize[1], this.camera[1] + dist);
//             newPos[1] = toMove;
//         }

//         if (this.camera[0] !== newPos[0] || this.camera[1] !== newPos[1]) {
//             this.setCamera(newPos);
//         }
//     }

//     setCamera = (pos: Point) => {
//         store.dispatch(moveCamera(pos));
//     }

//     zUp = () => {
//         store.dispatch(zLevelUp());
//     }

//     zDown = () => {
//         store.dispatch(zLevelDown());
//     }

//     zGoto = (level: number) => {
//         store.dispatch(zLevelGoto(level));
//     }
// }
