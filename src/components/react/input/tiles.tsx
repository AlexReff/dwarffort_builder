import { h } from "preact";
import { useCallback } from "preact/hooks";
import { BUILDINGS, IBuildingTile, IMenuItem, INPUT_STATE, Point, TILE_H, TILE_W } from "../../constants";
import { inspectAllOfTypeAtGridPos, inspectGridPos, useSelectors, useThunkDispatch } from "../../redux";
import { eventToPosition } from "../../util";
import { Toolbar } from "./toolbar";

interface IInspectTilesProps {
    mouseDown: boolean;
    mousePos: Point;
}

export const InspectTiles = (props: IInspectTilesProps) => {
    const dispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "gridBounds",
        "cameraX",
        "cameraY",
        "cameraZ",
        "buildingTiles",
        "buildingPositions",
        "mapWidth",
        "mapHeight",
        "inspectedBuildings",
        "inputState",
        "highlightedBuildings",
    ]);

    const handleBuildingClick = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const [gridX, gridY] = eventToPosition(e, reduxState.gridBounds);
        dispatch(inspectGridPos(gridX, gridY));
    }, [reduxState.gridBounds]);

    const handleBuildingDoubleClick = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const [gridX, gridY] = eventToPosition(e, reduxState.gridBounds);
        dispatch(inspectAllOfTypeAtGridPos(gridX, gridY));
    }, [reduxState.gridBounds]);

    if (!(reduxState.cameraZ in reduxState.buildingTiles) ||
        Object.keys(reduxState.buildingTiles[reduxState.cameraZ]).length === 0) {
        return (
            <div></div>
        );
    }

    let minX = TILE_W * (reduxState.mapWidth * 2);
    let minY = TILE_H * (reduxState.mapHeight * 2);
    let maxX = -1, maxY = -1;

    let hasInspectTargets = false;

    const tiles = Object.keys(reduxState.buildingTiles[reduxState.cameraZ]).map((key) => {
        const tile: IBuildingTile = reduxState.buildingTiles[reduxState.cameraZ][key];
        const bldg: IMenuItem = BUILDINGS.ITEMS[tile.key];

        const radi = Math.floor(bldg.tiles.length / 2.0);

        const mapLeft = tile.posX - radi;
        const mapTop = tile.posY - radi;
        const gridLeft = mapLeft - reduxState.cameraX;
        const gridTop = mapTop - reduxState.cameraY;

        // const left = reduxState.gridBounds.left + (TILE_W * gridLeft);
        // const top = reduxState.gridBounds.top + (TILE_H * gridTop);
        const left = TILE_W * gridLeft;
        const top = TILE_H * gridTop;

        const width = TILE_W * bldg.tiles.length;
        const height = TILE_H * bldg.tiles.length;

        const style = {
            width: `${width}px`,
            height: `${height}px`,
            left: `${left}px`,
            top: `${top}px`,
        };

        const posKey = `${tile.posX}:${tile.posY}`;
        const thisInspected = reduxState.inspectedBuildings.some((m) => m === posKey);

        if (thisInspected) {
            hasInspectTargets = true;
            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, left + width);
            maxY = Math.max(maxY, top + height);
        }

        const thisClass = "building_inspect"
            + (thisInspected ? " inspecting" : "")
            + (reduxState.highlightedBuildings.some((m) => m === posKey) ? " highlighted" : "");

        return (
            <a
                class={thisClass}
                title={bldg.text}
                onClick={handleBuildingClick}
                onDblClick={handleBuildingDoubleClick}
                style={style}
            ></a>
        );
    });

    let wrapperClass = "inspect_wrapper";
    if (reduxState.inputState === INPUT_STATE.INSPECTING) {
        wrapperClass += " inspecting";
    }
    if (props.mouseDown) {
        console.log("dragging added due to mouseDown==true");
        wrapperClass += " dragging"; //disables pointer events
    }

    return (
        <div class={wrapperClass}>
            {tiles}
            <Toolbar
                mousePos={props.mousePos}
                hasInspectTargets={hasInspectTargets}
                minX={minX}
                maxX={maxX}
                minY={minY}
                maxY={maxY}
            />
        </div>
    );
};
