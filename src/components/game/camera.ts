import { Point } from "../constants";
import { Game } from "../game";
import { Tile } from "../tile";

export class GameCamera extends Game {
    protected camera: Point;
    // protected center: Point;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);

        // this.center = [
        //     Math.ceil(this.gridSize[0] / 2.0),
        //     Math.ceil(this.gridSize[1] / 2.0),
        // ];

        this.resetCamera();
    }

    resetCamera = () => {
        this.camera = [
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
            Math.floor((this.mapSize[1] - this.gridSize[1]) / 2),
        ];
    }

    getCamera = () => {
        return [this.camera[0], this.camera[1]];
    }

    /**
     * Returns Map coordinate position
     */
    getMousePosition = (e: MouseEvent | TouchEvent | { clientX: number; clientY: number; }) => {
        const gridCoord = this.display.eventToPosition(e);
        return this.getMapCoord(gridCoord);
    }

    getTileAtMouse = (clientX: number, clientY: number): Tile => {
        const coord = this.getMousePosition({ clientX, clientY });
        // const coord = this.getMapCoord(mouse);
        return this.gameGrid[this.zLevel][coord[0]][coord[1]];
    }

    /**
     * Converts a GRID coordinate to a MAP coordinate
     */
    getMapCoord = (coord: Point): Point => {
        return [
            coord[0] + this.camera[0],
            coord[1] + this.camera[1],
        ];
    }

    /**
     * Converts a MAP coordinate to a GRID coordinate
     */
    getGridCoord = (coord: Point): Point => {
        if (coord[0] < this.camera[0] ||
            coord[1] < this.camera[1] ||
            coord[0] >= this.camera[0] + this.gridSize[0] ||
            coord[1] >= this.camera[1] + this.gridSize[1]) {
            return null;
        }
        return [
            coord[0] - this.camera[0],
            coord[1] - this.camera[1],
        ];
    }
}
