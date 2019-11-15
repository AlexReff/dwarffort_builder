import { Fragment, h } from "preact";
import { Ref, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { Animator } from "./animator";
import { IRenderTile, TILE_H, TILE_MAP, TILE_URL, TILE_W } from "./constants";
import { Input } from "./react/input";
import { FlatReduxState, Initialize, useSelectors, useThunkDispatch } from "./redux";
import { Resizer } from "./resizer";
import Display from "./rot/display";
import { getBuilderTiles } from "./tiles/builder";
import { getCursorTiles } from "./tiles/cursor";
import { getDecoratorTiles } from "./tiles/decorator";
import { getDiggerTiles } from "./tiles/digger";
import { renderTile } from "./util";

const getTileFuncs = [
    getCursorTiles,
    getBuilderTiles,
    getDiggerTiles,
    getDecoratorTiles,
] as const;

export const GameReduxProps = [
    "cameraX",
    "cameraY",
    "cameraZ",
    "gridWidth",
    "gridHeight",
    "buildingTiles",
    "inputState",
    "currentMenuItem",
    "cursorRadius",
    "cursorX",
    "cursorY",
    "buildPlaceWidth",
    "buildPlaceHeight",
    "animationFlag",
    "designateStartX",
    "designateStartY",
    "terrainTiles",
    "buildingPositions",
    "mapHeight",
    "mapWidth",
    "animationFlag",
] as const;

export type GameReduxState = Pick<FlatReduxState, typeof GameReduxProps[number]>;

interface IGameProps {
    gridRef: Ref<HTMLDivElement>;
}

export const Game = (props: IGameProps) => {
    const reduxDispatch = useThunkDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tileSheetImage, setTileSheetImage] = useState<HTMLImageElement>(null);
    const [rotDisplay, setRotDisplay] = useState<Display>(null);
    const reduxState = useSelectors(GameReduxProps);
    const initializeCalled = useRef<boolean>(false);

    //load tilesheet image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.id = "tilesheet";
        img.onload = () => {
            setTileSheetImage(img);
        };
        img.src = TILE_URL;
    }, []);

    //initialize Display
    useLayoutEffect(() => {
        if (tileSheetImage == null || props.gridRef.current == null) {
            //stop if nothing is loaded
            console.log("nothing loaded");
            return;
        }

        if (!initializeCalled.current) {
            //initialize once
            reduxDispatch(Initialize(props.gridRef.current));
            initializeCalled.current = true;
            console.log("Initialize called");
        }

        if (!initializeCalled.current ||
            reduxState.gridWidth === 0 ||
            reduxState.gridHeight === 0) {
            //stop if redux variables not yet updated
            console.log("Redux props not updated");
            return;
        }

        console.log("Setting rotDisplay");
        setRotDisplay(new Display({
            canvasElement: canvasRef.current,
            width: reduxState.gridWidth,
            height: reduxState.gridHeight,
            layout: Display.TileGL.isSupported() ? "tile-gl" : "tile",
            tileWidth: TILE_W,
            tileHeight: TILE_H,
            tileSet: tileSheetImage,
            tileMap: TILE_MAP,
            tileColorize: true,
            bg: "transparent",
        }));
    }, [
        canvasRef.current,
        tileSheetImage,
        reduxState.gridWidth,
        reduxState.gridHeight,
    ]);

    useEffect(() => {
        if (rotDisplay == null) {
            return;
        }

        rotDisplay.clear();

        const startX = reduxState.cameraX;
        const startY = reduxState.cameraY;
        const maxX = startX + reduxState.gridWidth;
        const maxY = startY + reduxState.gridHeight;

        const renderedPositions = new Set<string>();
        for (const getTiles of getTileFuncs) {
            const tiles = getTiles(reduxState);
            for (const tile of tiles) {
                const key = `${tile.x}:${tile.y}`;
                if (renderedPositions.has(key)) {
                    continue;
                }
                if (tile.x >= startX && tile.x < maxX &&
                    tile.y >= startY && tile.y < maxY) {
                    renderTile(tile, rotDisplay, reduxState);
                    renderedPositions.add(key);
                }
            }
        }
    }, [
        rotDisplay,
        reduxState, //re-render on every redux update
    ]);

    return (
        <Fragment>
            <Resizer gridElement={props.gridRef} />
            <Animator />
            <Input canvasRef={canvasRef} />
            <canvas id="canvas" ref={canvasRef}></canvas>
        </Fragment>
    );
};
