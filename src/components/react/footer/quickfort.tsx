import { h } from "preact";
import { useState } from "preact/hooks";
import { useSelectors } from "../../redux";
import { getQuickfortCsv } from "../../serialize";

export const QuickfortLink = () => {
    const [quickfortUrl, setQuickfortUrl] = useState<string>(null);
    const [lastQuickfortValue, setLastQuickfortValue] = useState<string>(null);
    const { terrainTiles } = useSelectors([
        "terrainTiles",
    ]);

    if (Object.keys(terrainTiles).length === 0) {
        return null;
    }

    const csv = getQuickfortCsv();
    if (csv !== lastQuickfortValue) {
        const csvFile = new Blob([csv], { type: "text/csv" });
        if (quickfortUrl) {
            window.URL.revokeObjectURL(quickfortUrl);
        }
        setQuickfortUrl(window.URL.createObjectURL(csvFile));
        setLastQuickfortValue(csv);
    }

    return (
        <a href={quickfortUrl} target="_blank" download="fortd.csv">Download Quickfort CSV</a>
    );
};
