import OpenSimplexNoise from "open-simplex-noise";
import { DEC_TILES, DEC_TILES_COLORS, IRenderTile } from "../../constants";
import rng from "../../rot/rng";
import { ICameraState } from "./reducer";

class Decorator {
    /** Key: zLevel */
    decoratorTiles: { [key: string]: { [key: string]: IRenderTile } };
    /** Used for tracking grid resizes | Key: zLevel */
    decoratorMaxSizes: { [key: string]: { x: number, y: number } };
    noiseMaps: { [key: string]: OpenSimplexNoise };

    constructor() {
        this.decoratorTiles = {};
        this.decoratorMaxSizes = {};
        this.noiseMaps = {};
    }

    getTiles = (state: ICameraState) => {
        this.initFloor(state);
        return Object.values(this.decoratorTiles[state.cameraZ]);
    }

    initFloor = (state: ICameraState) => {
        if (state.cameraZ in this.decoratorTiles) {
            //already populated, check to see if mapSize has expanded
            if (state.mapHeight <= this.decoratorMaxSizes[state.cameraZ].y &&
                state.mapWidth <= this.decoratorMaxSizes[state.cameraZ].x) {
                return;
            }
        }
        if (!(state.cameraZ in this.noiseMaps)) {
            this.noiseMaps[state.cameraZ] = new OpenSimplexNoise(Date.now() * rng.getUniform());
        }
        const noiseMap = this.noiseMaps[state.cameraZ].array2D(state.mapWidth, state.mapHeight).map((e) => {
            return e.map((x) => {
                return Math.floor(((x + 1.0) / 2.0) * 100.0);
            });
        });
        const bucket = {};
        for (let x = 0; x < noiseMap.length; x++) {
            for (let y = 0; y < noiseMap[x].length; y++) {
                if (noiseMap[x][y] <= 15) {
                    bucket[`${x}:${y}`] = this.getRandomDecoratorTile(x, y);
                }
            }
        }
        this.decoratorTiles[state.cameraZ] = bucket;
        this.decoratorMaxSizes[state.cameraZ] = { x: state.mapWidth, y: state.mapHeight };
    }

    getRandomDecoratorTile = (x: number, y: number): IRenderTile => {
        const char = `z${rng.getUniformInt(0, DEC_TILES.length - 1)}`;
        const color = DEC_TILES_COLORS[rng.getUniformInt(0, DEC_TILES_COLORS.length - 1)];
        return {
            x,
            y,
            char,
            color,
        };
    }
}

const DecoratorInstance = new Decorator();

export default DecoratorInstance;
