// import { toggleAnimation } from "../redux/camera/actions";
// import store from "../redux/store";

// /**
//  * Requires CAMERA, CURSOR
//  */
// export class GameAnimator {
//     private animationToggle: boolean;
//     private animationInterval: number;

//     constructor() {
//         this.animationToggle = false;
//         this.animationInterval = window.setInterval(() => (this.handleToggle()), 250);
//         // store.subscribe(this.getStoreData);
//     }

//     // getStoreData = () => {
//     //     const newState = store.getState();
//     //     this.animationToggle = newState.camera.animationToggle;
//     // }

//     isAnimating = () => this.animationToggle;

//     private handleToggle = () => {
//         // store.dispatch(toggleAnimation());
//         this.animationToggle = !this.animationToggle;
//     }
// }

// export default GameAnimator;
