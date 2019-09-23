import { IRenderTile } from "../constants";
import { FlatReduxState } from "../redux/store";
import { ITileGeneratorComponent } from "./_base";

export class Builder implements ITileGeneratorComponent {
    getTiles = (state: FlatReduxState): IRenderTile[] => {
        return [];
    }
}
