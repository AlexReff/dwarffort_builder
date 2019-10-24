import { IRenderTile, ITerrainTile, MENU_ID, Point } from "../constants";
import { FlatReduxState } from "../redux/";
import { getNeighborsOfRange } from "../util";
import { ITileGeneratorComponent } from "./_base";

export class Digger implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        let result: IRenderTile[] = [];
        if (state.terrainTiles == null ||
            Object.keys(state.terrainTiles).length === 0 ||
            !(state.cameraZ in state.terrainTiles) ||
            Object.keys(state.terrainTiles[state.cameraZ]).length === 0) {
            //no terrain
            return result;
        }
        const theseTiles = state.terrainTiles[state.cameraZ];
        const floorTiles: Point[] = [];
        for (const key of Object.keys(theseTiles)) {
            const tile: ITerrainTile = theseTiles[key];
            switch (tile.type) {
                case MENU_ID.upstair:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `i60`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
                case MENU_ID.downstair:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `i62`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
                case MENU_ID.udstair:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `i88`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
                case MENU_ID.upramp:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `i30`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
                case MENU_ID.channel:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `i31`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
                case MENU_ID.mine:
                    floorTiles.push([tile.posX, tile.posY]);
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `f${tile.characterVariant}`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
            }
        }
        const floorTilesToAdd = {};
        for (const pos of floorTiles) {
            const toCheck = getNeighborsOfRange(pos[0], pos[1], pos[0], pos[1], state);
            for (const point of toCheck) {
                if (!result.some((m) => m.x === point[0] && m.y === point[1])) {
                    floorTilesToAdd[`${point[0]}:${point[1]}`] = {
                        x: point[0],
                        y: point[1],
                        char: ["f0", "i178"],
                        color: ["rgba(50, 50, 50, .2)", "transparent"],
                    };
                }
            }
        }
        result = result.concat(Object.values(floorTilesToAdd));
        return result;
    }
}
