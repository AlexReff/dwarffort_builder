import { Point } from "../constants";
import { Game } from "../game";

export class GameCamera extends Game {
    protected camera: Point;
    protected center: Point;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);

        this.camera = [
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
        ];

        this.center = [
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ];
    }

    /**
     * Converts a GRID coordinate to a MAP coordinate
     */
    public getMapCoord = (coord: Point): Point => {
        return [
            coord[0] + this.camera[0],
            coord[1] + this.camera[1],
        ];
    }

    /**
     * Converts a MAP coordinate to a GRID coordinate
     */
    public getGridCoord = (coord: Point): Point => {
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
