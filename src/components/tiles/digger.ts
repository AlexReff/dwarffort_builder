import { IRenderTile, TILETYPE } from "../constants";
import { ITerrainTile } from "../redux/digger/reducer";
import { FlatReduxState } from "../redux/store";
import { ITileGeneratorComponent } from "./_base";

export class Digger implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        const result: IRenderTile[] = [];
        if (state.terrainTiles == null ||
            Object.keys(state.terrainTiles).length === 0 ||
            !(state.cameraZ in state.terrainTiles) ||
            Object.keys(state.terrainTiles[state.cameraZ]).length === 0) {
            //no terrain
            return result;
        }
        const theseTiles = state.terrainTiles[state.cameraZ];
        for (const key of Object.keys(theseTiles)) {
            const tile: ITerrainTile = theseTiles[key];
            switch (tile.type) {
                case TILETYPE.Wall:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: ["f0", `w${tile.characterVariant}`],
                        color: ["rgba(50, 50, 50, .2)", "transparent"],
                    });
                    break;
                case TILETYPE.Floor:
                    result.push({
                        x: tile.posX,
                        y: tile.posY,
                        char: `f${tile.characterVariant}`,
                        color: "rgba(50, 50, 50, .2)",
                    });
                    break;
            }
        }
        return result;
    }
}
