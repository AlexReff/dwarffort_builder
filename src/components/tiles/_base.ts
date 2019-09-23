import { IRenderTile } from "../constants";
import { FlatReduxState } from "../redux/store";

export interface ITileGeneratorComponent {
    /** Returns all tiles for the current z-level */
    getTiles: (state: FlatReduxState) => IRenderTile[];
}

/*
export class NEW_THING implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        return [];
    }
}
*/
