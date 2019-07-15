import * as _ from "lodash";
import { Constants, Direction } from "./constants";

class Cursor {
    private position: [number, number];
    private character: string;
    private color: string;

    constructor(pos: [number, number] = [0, 0]) {
        this.character = ".";
        this.position = pos;
        // this.color = "rgba(255,255,0,1)";
        this.color = "rgba(157,132,19,1)";
    }

    public getCharacter() {
        return this.character;
    }

    public getPosition() {
        return this.position;
    }

    public getColor() {
        return this.color;
    }

    public setPosition(pos: [number, number]) {
        this.position = pos;
    }

    public getDrawData() {
        return [
            this.position[0],
            this.position[1],
            this.character,
            this.color,
            "transparent",
        ];
    }
}

export { Cursor };
