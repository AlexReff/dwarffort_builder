
// function applyMixins(derivedCtor: any, baseCtors: any[]) {
//     baseCtors.forEach((baseCtor) => {
//         Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//             Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
//         });
//     });
// }

// tslint:disable-next-line: interface-name no-empty-interface
// interface Game extends GameBuilder {}
// applyMixins(Game, [GameBuilder]);

//export default GameUtil(Game);

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

    // /**
    //  * Re-draws only 'dirty' tiles
    //  */
    // renderDirty = () => {
    //     if (// this.dirtyTiles == null || // this.dirtyTiles.length === 0) {
    //         return;
    //     }
    //     const dirty = new Array<Point>();
    //     while (// this.dirtyTiles.length > 0) {
    //         dirty.push(// this.dirtyTiles.pop());
    //     }
    //     for (const coord of dirty) {
    //         this.renderPosition(coord);
    //     }
    // }

    // handleMouseDown = (e: MouseEvent) => {
    //     if (e.button === 0) {
    //         this.mouseLeftPressed(true);
    //         if (this.inspecting) {
    //             this.setHighlightPos([window.mouseX, window.mouseY]);
    //         }
    //     }
    // }

    // handleMouseUp = (e: MouseEvent) => {
    //     if (e.button === 0) {
    //         if (this.highlighting) {
    //             // handle 'highlight selection'
    //         }
    //         this.mouseLeftPressed(false);
    //         this.endHighlight();
    //         // this.setState({
    //         //     leftMouseDown: false,
    //         //     highlighting: false,
    //         //     highlightingStart: null,
    //         // });
    //     }
    // }

    // coordIsBuildable = (coord: Point): boolean => {
    //     const isBldg = this.gameGrid[this.zLevel][coord[0]][coord[1]].isBuilding();
    //     if (isBldg) {
    //         return false;
    //     }
    //     if (this.strictMode) {
    //         const tileType = this.gameGrid[this.zLevel][coord[0]][coord[1]].getType();
    //         if (tileType === TileType.Floor) {
    //             return true;
    //         }
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    // renderCursor = () => {
    //     for (const i of this.buildingRange) {
    //         this.renderPosition(i);
    //     }
    // }

    // renderDesignated = () => {
    //     if (this.designatorTiles == null || this.designatorTiles.length === 0) {
    //         return;
    //     }
    //     for (const coord of this.designatorTiles) {
    //         this.renderPosition(coord);
    //     }
    // }

    // updateGameSize = (container: HTMLElement) => {
    //     if (this.gridSize != null && this.gridSize.length === 2) {
    //         store.dispatch(SetGridSize([
    //             Math.max(this.gridSize[0], Math.floor(container.offsetWidth / TILE_W)),
    //             Math.max(this.gridSize[1], Math.floor(container.offsetHeight / TILE_H)),
    //         ]));
    //     } else {
    //         store.dispatch(SetGridSize([
    //             Math.floor(container.offsetWidth / TILE_W),
    //             Math.floor(container.offsetHeight / TILE_H),
    //         ]));
    //     }

    //     store.dispatch(SetMapSize([
    //         Math.max(this.mapSize[0], this.gridSize[0]),
    //         Math.max(this.mapSize[1], this.gridSize[1]),
    //     ]));

    //     this.needsRender = true;
    // }

    // handleMenuEvent = (e: string) => {
    //     if (e == null || e.length === 0) {
    //         return;
    //     }

    //     // if (e === "inspect") {
    //     //     this.game.hideCursor();
    //     // } else {
    //     //     this.game.showCursor();
    //     // }

    //     if (e === "top") {
    //         // this.setState({
    //         //     currentMenuItem: null,
    //         //     currentMenu: "top",
    //         // });
    //         this.props.selectMenu("top");
    //         return;
    //     }

    //     if (SUBMENUS[e] != null) {
    //         // this.setState({
    //         //     currentMenuItem: null,
    //         //     currentMenu: SUBMENUS[e],
    //         // });
    //         this.props.selectMenu(SUBMENUS[e]);
    //         return;
    //     }

    //     if (e === "escape") {
    //         // if (this.props.cursorBuilding) {
    //         //     // this.setState({
    //         //     //     currentMenuItem: null,
    //         //     // });
    //         //     // this.game.stopBuilding();
    //         //     this.game.handleEscapeKey();
    //         // } else if (this.game.isDesignating()) {
    //         //     // this.game.cancelDesignate();
    //         if (this.props.cursorBuilding || this.props.isDesignating) {
    //             this.game.handleEscapeKey();
    //         } else if (this.props.currentMenuItem != null) {
    //             this.props.selectMenuItem(null);
    //         } else {
    //             // go up one menu level
    //             let newMenu = "";
    //             const idx = this.props.currentMenu.lastIndexOf(":");
    //             if (idx > 0) {
    //                 newMenu = this.props.currentMenu.substr(0, idx);
    //             } else {
    //                 newMenu = "top";
    //             }
    //             this.props.selectMenu(newMenu);
    //         }
    //     } else {
    //         if (this.props.currentMenuItem !== e) {
    //             this.props.selectMenuItem(e as MENU_ITEM);
    //             // this.setState({
    //             //     currentMenuItem: e as MENU_ITEM,
    //             // });
    //             if (e in BUILDINGS) {
    //                 // this.game.setCursorToBuilding(e as MENU_ITEM);
    //             }
    //         }
    //     }
    // }

    // getFooterDetails = (tile: Tile) => {
    //     const result = [];
    //     const pos = tile.getPosition();
    //     result.push((
    //         <div class="info-coord">{`[${pos[0]},${pos[1]}]`}</div>
    //     ));
    //     const type = tile.getType();
    //     switch (type) {
    //         case TileType.Building:
    //             result.push((
    //                 <div class="info-bldg">{tile.getBuildingName()} (Building)</div>
    //             ));
    //             break;
    //         case TileType.Empty:
    //             break;
    //         default:
    //             result.push((
    //                 <div class="info-type">{TileType[type]}</div>
    //             ));
    //             break;
    //     }

    //     return result;
    // }

    // renderFooterMouse = () => {
    //     if (this.game == null) {
    //         return;
    //     }

    //     if (!this.props.mouseOverGrid) {
    //         return;
    //     }

    //     const tile = this.game.getTileAtMouse(window.mouseX, window.mouseY);
    //     if (tile) {
    //         return this.getFooterDetails(tile);
    //     }
    // }

    // renderFooterCursor = () => {
    //     if (this.game == null) {
    //         return;
    //     }
    //     const result = [];
    //     const tile: Tile = this.game.getTileAtCursor();
    //     if (tile) {
    //         result.push(this.getFooterDetails(tile));
    //     }
    //     if (this.game.isDesignating()) {
    //         result.push((
    //             <div class="info-status">Designating {MENU_IDS[this.props.currentMenuItem].text}</div>
    //         ));
    //     }
    //     return result;
    // }

// onEnd(e: MouseEvent | TouchEvent) {
//     e.preventDefault();
//     this.dragging = false;

//     let maxWidthOffset = (this.totalColSize + 1) * TILE_SIZE - this.gridElement.offsetWidth;
//     let maxHeightOffset = (this.totalRowSize + 1) * TILE_SIZE - this.gridElement.offsetHeight;

//     if (this.offsetX > 0 || this.offsetY > 0 ||
//         maxWidthOffset < 0 || maxHeightOffset < 0 ||
//         this.offsetX < -1 * Math.abs(maxWidthOffset) ||
//         this.offsetY < -1 * Math.abs(maxHeightOffset)) {
//         let v = { x: this.offsetX, y: this.offsetY };
//         if (this.tween) this.tween.kill();
//         let center = this.getCenterPos();
//         let thisX = maxWidthOffset > 0 ? -1 * maxWidthOffset : center.x;
//         let thisY = maxHeightOffset > 0 ? -1 * maxHeightOffset : center.y;
//         this.tween = TweenMax.to(v, 0.4,
//             {
//                 // x: Math.max(Math.min(0, this.offsetX), -1 * maxWidthOffset),
//                 // y: Math.max(Math.min(0, this.offsetY), -1 * maxHeightOffset),
//                 x: thisX, // _.clamp(this.offsetX, -1 * maxWidthOffset, 0),
//                 y: thisY, // _.clamp(this.offsetY, -1 * maxHeightOffset, 0),
//                 onUpdate: () => {
//                     this.snapBackCallback(v.x, v.y);
//                 }
//             });
//     }
// }

// onMove(e: MouseEvent | TouchEvent) {
//     if (this.dragging) {
//         let target = e instanceof MouseEvent ? e : e.touches[0];
//         let xDelta = target.clientX - this.lastX;
//         let yDelta = target.clientY - this.lastY;
//         let velocity = Math.abs(xDelta * yDelta);

//         if (velocity > MAX_VELOCITY) {
//             let v = { x: xDelta * 0.5, y: yDelta * 0.5 };
//             if (this.tween) this.tween.kill();
//             this.tween = TweenMax.to(v, 0.5,
//                 {
//                     x: 0, y: 0,
//                     onUpdate: () => {
//                         this.onDragCallback(v.x, v.y);
//                     }
//                 });
//         }

//         this.lastX = target.clientX;
//         this.lastY = target.clientY;

//         this.onDragCallback(xDelta, yDelta);
//     }
// }
