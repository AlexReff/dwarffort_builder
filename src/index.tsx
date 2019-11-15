//libraries
import { Component, h, render } from "preact";
import { useRef, useState } from "preact/hooks";
import { Provider } from "react-redux";
//components
import { HEADER_H, MENU_W, TILE_H, TILE_W } from "./components/constants";
import { Game } from "./components/game";
import { Footer } from "./components/react/footer";
import { Header } from "./components/react/header";
import { Menu } from "./components/react/menu";
import { store } from "./components/redux";

require("./css/index.scss");

export const FortressDesigner = () => {
    const gridRef = useRef<HTMLDivElement>(null);
    const lastGridTemplateRow = useRef<number>(0);
    const lastGridTemplateCol = useRef<number>(0);

    const centerCss = lastGridTemplateRow.current === 0
        && lastGridTemplateCol.current === 0
        ? { margin: "auto 0" }
        : {};

    if (gridRef.current != null) {
        lastGridTemplateCol.current = (gridRef.current.offsetWidth - lastGridTemplateCol.current) % TILE_W;
        lastGridTemplateRow.current = (gridRef.current.offsetHeight - lastGridTemplateRow.current) % TILE_H;
    }

    const wrapperCss = {
        gridTemplateColumns: `1fr ${(MENU_W + lastGridTemplateCol.current).toString()}px`,
        gridTemplateRows: `${HEADER_H.toString()}px 1fr ${(HEADER_H + lastGridTemplateRow.current).toString()}px`,
    };

    return (
        <div id="page">
            <div id="wrapper" style={wrapperCss}>
                <div id="header">
                    <div class="left"><a class="home-link" href="https://reff.dev/">reff.dev</a></div>
                    <div class="center" style={centerCss}>
                        <a href="/" class="title">Fortress Designer</a>
                    </div>
                    <div class="right">
                        <Header />
                    </div>
                </div>
                <div id="grid" ref={gridRef}>
                    <div class="loading">Loading...</div>
                    <Game gridRef={gridRef} />
                </div>
                <Menu />
                <Footer />
            </div>
        </div>
    );
};

render(<Provider store={store}><FortressDesigner /></Provider>, document.getElementById("body"));
