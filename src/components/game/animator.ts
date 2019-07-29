import { Point } from "../constants";
import { GameBuilder } from "./builder";

/**
 * Requires CAMERA, CURSOR
 */
export class GameAnimator extends GameBuilder {
    protected animationToggle: boolean;
    protected animationInterval: number;

    constructor(image: HTMLImageElement, container: HTMLElement) {
        super(image, container);
        this.animationToggle = false;
        this.animationInterval = window.setInterval(() => (this.toggleAnimation()), 250);
    }

    protected isTileAnimating = (pos: Point): boolean => {
        if (!this.animationToggle) {
            return false;
        }
        return this.coordIsDesignating(pos);
    }

    protected coordIsDesignating = (pos: Point): boolean => {
        if (this.isDesignating()) {
            const cursor = this.cursor.getPosition();
            const bounds = this.designator.getRange(cursor);
            return pos[0] >= bounds.startX && pos[1] >= bounds.startY && pos[0] <= bounds.endX && pos[1] <= bounds.endY;
        }

        return false;
    }

    protected toggleAnimation = () => {
        this.animationToggle = !this.animationToggle;
        this.renderDirty();
        this.renderDesignated();
    }
}
