import * as _ from "lodash";
import { Constants, Direction, IGridRange, Point } from "./constants";

class Designator {
    private designating: boolean;
    private designationStart: Point;

    constructor(pos?: Point) {
        if (pos != null) {
            this.designationStart = [pos[0], pos[1]];
        }

        this.designating = false;
    }

    public getDrawData(coord: Point) {
        return [
            coord[0],
            coord[1],
            ",",
            coord[0] === this.designationStart[0] && coord[1] === this.designationStart[1] ? "rgba(28, 68, 22, .5)" : "rgba(72, 36, 12, .3)",
            "transparent",
        ];
    }

    public getStartPosition() {
        return [this.designationStart[0], this.designationStart[1]];
    }

    public getRange(cursor: Point): IGridRange {
        const startX = Math.min(this.designationStart[0], cursor[0]);
        const endX = Math.max(this.designationStart[0], cursor[0]);
        const startY = Math.min(this.designationStart[1], cursor[1]);
        const endY = Math.max(this.designationStart[1], cursor[1]);

        return {
            startX,
            endX,
            startY,
            endY,
        };
    }

    public isDesignating() {
        return this.designating;
    }

    public startDesignating(pos: Point) {
        this.designationStart = [pos[0], pos[1]];
        this.designating = true;
    }

    public endDesignating() {
        this.designationStart = null;
        this.designating = false;
    }
}

export { Designator };
