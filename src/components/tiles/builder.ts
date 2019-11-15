import { RenderTileState } from ".";
import { BUILDING_KEYS, BUILDINGS, IRenderTile, MENU_ID } from "../constants";

export const getBuilderTiles = (state: RenderTileState): IRenderTile[] => {
    const result: IRenderTile[] = [];
    if (!(state.cameraZ in state.buildingTiles)) {
        return result;
    }
    for (const key of Object.keys(state.buildingTiles[state.cameraZ])) {
        const tile = state.buildingTiles[state.cameraZ][key];
        const bldg = BUILDINGS.ITEMS[tile.key as BUILDING_KEYS];
        if (bldg == null) {
            continue;
        }
        const range = Math.floor(bldg.tiles.length / 2.0);
        const startX = tile.posX - range;
        const startY = tile.posY - range;
        const endX = tile.posX + range;
        const endY = tile.posY + range;
        for (let y = startY, iy = 0; y <= endY; y++ && iy++) {
            for (let x = startX, ix = 0; x <= endX; x++ && ix++) {
                const trgTile = bldg.tiles[iy][ix];
                if (trgTile == null || trgTile.char == null) {
                    continue; //no building character to place here
                }
                if (tile.key === MENU_ID.wall) {
                    result.push({
                        x,
                        y,
                        char: ["f0", `w${tile.characterVariant}`],
                        color: ["rgba(50, 50, 50, .2)", "transparent"],
                    });
                } else {
                    let color = trgTile.fg;
                    const colStart = color.indexOf("(");
                    const colEnd = color.indexOf(")");
                    if (colStart !== -1 && colEnd !== -1) {
                        color = `rgba(${color.substr(colStart + 1, colEnd - colStart - 1)}, .3)`;
                    }
                    let bg = trgTile.bg;
                    const bgStart = bg.indexOf("(");
                    const bgEnd = bg.indexOf(")");
                    if (bgStart !== -1 && bgEnd !== -1) {
                        bg = `rgba(${bg.substr(bgStart + 1, bgEnd - bgStart - 1)}, .4)`;
                    }
                    const char = `i${trgTile.char}`;
                    result.push({
                        x,
                        y,
                        char,
                        color,
                        bg,
                    });
                }
            }
        }
    }
    return result;
};
