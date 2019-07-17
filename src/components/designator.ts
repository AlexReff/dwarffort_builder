import * as _ from "lodash";
import { Constants, Direction } from "./constants";

class Designator {
    // private isDesignating: boolean;
    private designationStart: [number, number];

    constructor(pos?: [number, number]) {
        if (pos != null) {
            this.designationStart = [pos[0], pos[1]];
        }

        // this.isDesignating = false;
    }

    public getStartPosition() {
        return [this.designationStart[0], this.designationStart[1]];
    }

    public getRange(cursor: [number, number]) {
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

    public startDesignating(pos: [number, number]) {
        this.designationStart = [pos[0], pos[1]];
        // this.isDesignating = true;
    }

    public endDesignating() {
        this.designationStart = null;
        // this.isDesignating = false;
    }
}

export { Designator };
