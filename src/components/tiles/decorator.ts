import OpenSimplexNoise from "open-simplex-noise";
import { RenderTileState } from ".";
import { DEC_TILES, DEC_TILES_COLORS, IRenderTile } from "../constants";
import rng from "../rot/rng";

/** Key: zLevel */
const decoratorTiles: { [key: string]: { [key: string]: IRenderTile } } = {};
/** Used for tracking grid resizes | Key: zLevel */
const decoratorMaxSizes: { [key: string]: { x: number, y: number } } = {};
const noiseMaps: { [key: string]: OpenSimplexNoise } = {};

const getRandomDecoratorTile = (x: number, y: number): IRenderTile => {
    const char = `z${rng.getUniformInt(0, DEC_TILES.length - 1)}`;
    const color = DEC_TILES_COLORS[rng.getUniformInt(0, DEC_TILES_COLORS.length - 1)];
    return {
        x,
        y,
        char,
        color,
    };
};

export const getDecoratorTiles = (state: RenderTileState) => {
    if (!(state.cameraZ in decoratorTiles) ||
        state.mapHeight > decoratorMaxSizes[state.cameraZ].y ||
        state.mapWidth > decoratorMaxSizes[state.cameraZ].x) {
        if (!(state.cameraZ in noiseMaps)) {
            noiseMaps[state.cameraZ] = new OpenSimplexNoise(Date.now() * rng.getUniform());
        }
        const noiseMap = noiseMaps[state.cameraZ].array2D(state.mapWidth, state.mapHeight).map((e) => {
            return e.map((x) => {
                return Math.floor(((x + 1.0) / 2.0) * 100.0);
            });
        });
        const bucket = {};
        for (let x = 0; x < noiseMap.length; x++) {
            for (let y = 0; y < noiseMap[x].length; y++) {
                if (noiseMap[x][y] <= 15) {
                    bucket[`${x}:${y}`] = getRandomDecoratorTile(x, y);
                }
            }
        }
        decoratorTiles[state.cameraZ] = bucket;
        decoratorMaxSizes[state.cameraZ] = { x: state.mapWidth, y: state.mapHeight };
    }

    return Object.values(decoratorTiles[state.cameraZ]);
};
