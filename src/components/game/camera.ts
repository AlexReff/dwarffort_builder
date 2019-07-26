import { Point } from "../constants";
import { Game } from "../game";
import { Tile } from "../tile";

export class GameCamera extends Game {
    protected camera: Point;
    protected center: Point;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);

        this.center = [
            Math.ceil(this.gridSize[0] / 2.0),
            Math.ceil(this.gridSize[1] / 2.0),
        ];

        this.resetCamera();
    }

    public resetCamera = () => {
        this.camera = [
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
            Math.floor((this.mapSize[0] - this.gridSize[0]) / 2),
        ];
    }

    public moveCameraToIncludePoint = (pos: Point, radius: number = 1) => {
        //for each NESW direction, move camera in that direction if needed
        if (pos[0] < 0 || pos[1] < 0 ||
            pos[0] > this.mapSize[0] ||
            pos[1] > this.mapSize[1]) {
            return;
        }
        if (pos[0] < this.camera[0]) {
            //MOVE NORTH
            const dist = Math.ceil((this.camera[0] - pos[0]) / 10) * 10;
            const toMove = Math.max(0, this.camera[0] - dist);
            this.camera[0] = toMove;
        } else if (pos[0] >= this.camera[0] + this.gridSize[0]) {
            //MOVE SOUTH
            const dist = Math.ceil((pos[0] + radius - this.camera[0] - this.gridSize[0]) / 10) * 10;
            const toMove = Math.min(this.mapSize[0] - this.gridSize[0], this.camera[0] + dist);
            this.camera[0] = toMove;
        }

        if (pos[1] < this.camera[1]) {
            //MOVE WEST
            const dist = Math.ceil((this.camera[1] - pos[1]) / 10) * 10;
            const toMove = Math.max(0, this.camera[1] - dist);
            this.camera[1] = toMove;
        } else if (pos[1] >= this.camera[1] + this.gridSize[1]) {
            //MOVE EAST
            const dist = Math.ceil((pos[1] + radius - this.camera[1] - this.gridSize[1]) / 10) * 10;
            const toMove = Math.min(this.mapSize[1] - this.gridSize[1], this.camera[1] + dist);
            this.camera[1] = toMove;
        }
    }

    public getMousePosition = (e: MouseEvent | TouchEvent | { clientX: number; clientY: number; }) => {
        const gridCoord = this.display.eventToPosition(e);
        return this.getMapCoord(gridCoord);
    }

    public getTileAtMouse = (clientX: number, clientY: number): Tile => {
        const coord = this.getMousePosition({ clientX, clientY });
        // const coord = this.getMapCoord(mouse);
        return this.gameGrid[this.zLevel][coord[0]][coord[1]];
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
