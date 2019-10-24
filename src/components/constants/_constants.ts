const styles = require("../.././css/_variables.scss");

export const DEFAULTS = {
    MAP_MIN_W: 48 * 2,
    MAP_MIN_H: 48 * 2,
    CURSOR_CHARACTER: ".",
    COLORS: {
        CURSOR_DEFAULT: "rgba(157,132,19,1)",
        CURSOR_PASSABLE: "rgba(0,255,0,1)",
        CURSOR_IMPASSABLE: "rgba(0,128,0,1)",
        CURSOR_INVALID: "rgba(128,0,0,1)",
        DESIGNATE_START: "rgba(28, 58, 22, .5)",
        DESIGNATE_RANGE: "rgba(72, 36, 12, .3)",
    },
};

export const MENU_W: number = Number(styles.menuWidth);
export const HEADER_H: number = Number(styles.headerHeight);

// Tile Data
export const TILE_W = styles.tileWidth;
export const TILE_H = styles.tileHeight;
export const TILE_URL = "/assets/Phoebus_cleaned.png";
