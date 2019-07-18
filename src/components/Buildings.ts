/*
Leather Works e
Quern q
Millstone M
Loom o
Clothier's Shop k
Bowyer's Workshop b
Carpenter's Workshop c
Metalsmith's Forge f
Magma Forge v
Jeweler's Workshop j
Mason's Workshop m
Butcher's Shop u
Tanner's Shop n
Craftsdwarf's Workshop r
Siege Workshop s
Mechanic's Workshop t
Still l
Farmer's Workshop w
Kitchen z
Fishery h
Ashery y
Dyer's Shop d
Soap Maker's Workshop S
Screw Press p
*/

class Building {
    text: string;
    key: string;
    id: string;
    characters: string[][];

    constructor(text: string, key: string, id: string, characters: string[][]) {
        this.text = text;
        this.key = key;
        this.id = id;
        this.characters = characters;
    }
}

class Buildings {
    // static leatherworks: Building = new Building();
}

export { Building, Buildings };
