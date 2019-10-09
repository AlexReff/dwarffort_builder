import { IMenuItem } from "..";

export const enum MENU_ID {
    //menu
    top = "top",
    building = "building",
    workshops = "workshops",
    furnaces = "furnaces",
    construction = "construction",
    designate = "designate",
    mine = "mine",
    channel = "channel",
    upstair = "upstair",
    downstair = "downstair",
    udstair = "udstair",
    upramp = "upramp",
    remove = "remove",
    stockpile = "stockpile",
    inspect = "inspect",
    inspectterrain = "inspectterrain",
    //buildings
    leatherworks = "leatherworks",
    quern = "quern",
    millstone = "millstone",
    loom = "loom",
    clothier = "clothier",
    bowyer = "bowyer",
    carpenter = "carpenter",
    forge = "forge",
    magmaforge = "magmaforge",
    jeweler = "jeweler",
    mason = "mason",
    butcher = "butcher",
    tanner = "tanner",
    craftsdwarf = "craftsdwarf",
    siege = "siege",
    mechanic = "mechanic",
    still = "still",
    farmers = "farmers",
    kitchen = "kitchen",
    fishery = "fishery",
    ashery = "ashery",
    dyer = "dyer",
    soap = "soap",
    screw = "screw",
    armorstand = "armorstand",
    bed = "bed",
    chair = "chair",
    coffin = "coffin",
    door = "door",
    cabinet = "cabinet",
    container = "container",
    table = "table",
    tradedepot = "tradedepot",
    wall = "wall",
    woodfurnace = "woodfurnace",
    smelter = "smelter",
    glassfurnace = "glassfurnace",
    kiln = "kiln",
    magmasmelter = "magmasmelter",
    magmaglassfurnace = "magmaglassfurnace",
    magmakiln = "magmakiln",
}

export const MENU_DATA = {
    [MENU_ID.top]: {
        text: "",
        key: "",
        parent: MENU_ID.top,
    },
    [MENU_ID.building]: {
        text: "Building",
        key: "b",
        parent: MENU_ID.top,
    },
    [MENU_ID.workshops]: {
        text: "Workshops",
        key: "w",
        parent: MENU_ID.building,
    },
    [MENU_ID.furnaces]: {
        text: "Furnaces",
        key: "e",
        parent: MENU_ID.building,
    },
    [MENU_ID.construction]: {
        text: "Construction",
        key: "C",
        parent: MENU_ID.building,
    },
    [MENU_ID.designate]: {
        text: "Designations",
        key: "d",
        parent: MENU_ID.top,
    },
    [MENU_ID.mine]: {
        text: "Mine (Floor)",
        key: "d",
        parent: MENU_ID.designate,
    },
    [MENU_ID.channel]: {
        text: "Channel",
        key: "h",
        parent: MENU_ID.designate,
    },
    [MENU_ID.upstair]: {
        text: "Up Stair",
        key: "u",
        parent: MENU_ID.designate,
    },
    [MENU_ID.downstair]: {
        text: "Down Stair",
        key: "j",
        parent: MENU_ID.designate,
    },
    [MENU_ID.udstair]: {
        text: "U/D Stair",
        key: "i",
        parent: MENU_ID.designate,
    },
    [MENU_ID.upramp]: {
        text: "Up Ramp",
        key: "r",
        parent: MENU_ID.designate,
    },
    [MENU_ID.remove]: {
        text: "Remove/Delete",
        key: "x",
        parent: MENU_ID.designate,
    },
    [MENU_ID.stockpile]: {
        text: "Stockpile",
        key: "p",
        parent: MENU_ID.top,
    },
    [MENU_ID.inspect]: {
        text: "Inspect Buildings",
        key: "q",
        parent: MENU_ID.top,
    },
    [MENU_ID.inspectterrain]: {
        text: "Inspect Terrain",
        key: "k",
        parent: MENU_ID.top,
    },
};

export type MENU_KEYS = keyof typeof MENU_DATA;

export const BUILDING_DATA = {
    [MENU_ID.leatherworks]: {
        text: "Leatherworks",
        key: "e",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "177",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                {
                    char: "177",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
                null,
            ],
            [
                {
                    char: "92",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
        ],
    },
    [MENU_ID.quern]: {
        text: "Quern",
        key: "q",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "9",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.millstone]: {
        text: "Millstone",
        key: "M",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "9",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.loom]: {
        text: "Loom",
        key: "o",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "195",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "35",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                {
                    char: "180",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "237",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 0, 255)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "167",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.clothier]: {
        text: "Clothier's shop",
        key: "k",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
                {
                    char: "237",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                null,
                null,
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 0)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "91",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
            ],
        ],
    },
    [MENU_ID.bowyer]: {
        text: "Bowyer's workshop",
        key: "b",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "238",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
                {
                    char: "40",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.carpenter]: {
        text: "Carpenter's workshop",
        key: "c",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "34",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
                null,
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
        ],
    },
    [MENU_ID.forge]: {
        text: "Forge",
        key: "f",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "31",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(0, 0, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "229",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "240",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.magmaforge]: {
        text: "Magma Forge",
        key: "v",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "92",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                {
                    char: "8",
                    bg: "rgb(128, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "196",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "8",
                    bg: "rgb(128, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "229",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
            ],
        ],
    },
    [MENU_ID.jeweler]: {
        text: "Jeweler's workshop",
        key: "j",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "42",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 0, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "42",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 0)",
                    walkable: 1,
                },
                {
                    char: "91",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "123",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
        ],
    },
    [MENU_ID.mason]: {
        text: "Mason's workshop",
        key: "m",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "59",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 1,
                },
                null,
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "91",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                null,
            ],
        ],
    },
    [MENU_ID.butcher]: {
        text: "Butcher's shop",
        key: "u",
        parent: "workshops",
        tiles: [
            [
                null,
                null,
                {
                    char: "178",
                    bg: "rgb(128, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "247",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 0, 0)",
                    walkable: 0,
                },
                null,
                {
                    char: "236",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 0, 0)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 0, 0)",
                    walkable: 1,
                },
                null,
            ],
        ],
    },
    [MENU_ID.tanner]: {
        text: "Tanner's shop",
        key: "n",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "8",
                    bg: "rgb(0, 128, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                null,
                null,
            ],
            [
                null,
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 0, 0)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "8",
                    bg: "rgb(0, 128, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                null,
                null,
            ],
        ],
    },
    [MENU_ID.craftsdwarf]: {
        text: "Craftsdwarf's workshop",
        key: "r",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "45",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
            ],
            [
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
            ],
        ],
    },
    [MENU_ID.siege]: {
        text: "Siege workshop",
        key: "s",
        parent: "workshops",
        tiles: [
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "92",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "47",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
                null,
                null,
            ],
            [
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
            ],
            [
                null,
                null,
                null,
                {
                    char: "126",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 0)",
                    walkable: 1,
                },
                null,
            ],
        ],
    },
    [MENU_ID.mechanic]: {
        text: "Mechanic's workshop",
        key: "t",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "128",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                {
                    char: "91",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "94",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 255, 255)",
                    walkable: 1,
                },
                {
                    char: "127",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.still]: {
        text: "Still",
        key: "l",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "246",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(0, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "205",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "184",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                null,
                {
                    char: "126",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 0)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "126",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 0)",
                    walkable: 1,
                },
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.farmers]: {
        text: "Farmer's workshop",
        key: "w",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "65",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                {
                    char: "240",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 0)",
                    walkable: 1,
                },
            ],
            [
                null,
                null,
                null,
            ],
            [
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                {
                    char: "210",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "237",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 255, 255)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.kitchen]: {
        text: "Kitchen",
        key: "z",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "246",
                    bg: "rgb(128, 128, 0)",
                    fg: "rgb(0, 0, 0)",
                    walkable: 1,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                null,
                null,
                {
                    char: "176",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
            ],
            [
                {
                    char: "236",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 0, 0)",
                    walkable: 1,
                },
                null,
                {
                    char: "59",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(0, 128, 0)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.fishery]: {
        text: "Fishery",
        key: "h",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "178",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                {
                    char: "224",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 0,
                },
                {
                    char: "35",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                null,
                null,
                null,
            ],
            [
                null,
                {
                    char: "178",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 0,
                },
                null,
            ],
        ],
    },
    [MENU_ID.ashery]: {
        text: "Ashery",
        key: "y",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "88",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                {
                    char: "45",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                null,
                {
                    char: "246",
                    bg: "rgb(128, 128, 0)",
                    fg: "rgb(0, 0, 0)",
                    walkable: 1,
                },
                null,
            ],
            [
                {
                    char: "177",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
                null,
                {
                    char: "247",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.dyer]: {
        text: "Dyer's shop",
        key: "d",
        parent: "workshops",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(128, 128, 0)",
                    fg: "rgb(0, 255, 0)",
                    walkable: 0,
                },
                {
                    char: "150",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
            ],
            [
                null,
                null,
                null,
            ],
            [
                {
                    char: "7",
                    bg: "rgb(128, 128, 0)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                null,
                {
                    char: "7",
                    bg: "rgb(128, 128, 0)",
                    fg: "rgb(0, 0, 255)",
                    walkable: 0,
                },
            ],
        ],
    },
    [MENU_ID.soap]: {
        text: "Soap maker's workshop",
        key: "S",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "150",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                {
                    char: "8",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 0,
                },
            ],
            [
                null,
                null,
                {
                    char: "8",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 0,
                },
            ],
            [
                null,
                {
                    char: "240",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(255, 255, 255)",
                    walkable: 1,
                },
                null,
            ],
        ],
    },
    [MENU_ID.screw]: {
        text: "Screw Press",
        key: "p",
        parent: "workshops",
        tiles: [
            [
                {
                    char: "207",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.armorstand]: {
        text: "Armor Stand",
        key: "a",
        parent: "building",
        tiles: [
            [
                {
                    char: "14",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.bed]: {
        text: "Bed",
        key: "b",
        parent: "building",
        tiles: [
            [
                {
                    char: "233",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.chair]: {
        text: "Seat/Chair/Throne",
        key: "c",
        parent: "building",
        tiles: [
            [
                {
                    char: "210",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.coffin]: {
        text: "Burial Receptacle/Coffin",
        key: "n",
        parent: "building",
        tiles: [
            [
                {
                    char: "48",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.door]: {
        text: "Door",
        key: "d",
        parent: "building",
        tiles: [
            [
                {
                    char: "197",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.cabinet]: {
        text: "Cabinet",
        key: "f",
        parent: "building",
        tiles: [
            [
                {
                    char: "227",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.container]: {
        text: "Container/Chest",
        key: "h",
        parent: "building",
        tiles: [
            [
                {
                    char: "146",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.table]: {
        text: "Table",
        key: "t",
        parent: "building",
        tiles: [
            [
                {
                    char: "209",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.tradedepot]: {
        text: "Trade Depot",
        key: "D",
        parent: "building",
        tiles: [
            [
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "219",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
                {
                    char: "79",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.wall]: {
        text: "Wall",
        key: "w",
        parent: "construction",
        tiles: [
            [
                {
                    char: "199",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(192, 192, 192)",
                    walkable: 0,
                },
            ],
        ],
    },
    [MENU_ID.woodfurnace]: {
        text: "Wood Furnace",
        key: "w",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.smelter]: {
        text: "Smelter",
        key: "s",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.glassfurnace]: {
        text: "Glass Furnace",
        key: "g",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.kiln]: {
        text: "Kiln",
        key: "k",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.magmasmelter]: {
        text: "Magma Smelter",
        key: "l",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.magmaglassfurnace]: {
        text: "Magma Glass Furnace",
        key: "a",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
    [MENU_ID.magmakiln]: {
        text: "Magma Kiln",
        key: "n",
        parent: "furnaces",
        tiles: [
            [
                null,
                {
                    char: "7",
                    bg: "rgb(192, 192, 192)",
                    fg: "rgb(255, 0, 0)",
                    walkable: 0,
                },
                {
                    char: "93",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
            [
                {
                    char: "61",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 0)",
                    walkable: 1,
                },
                null,
                null,
            ],
            [
                null,
                null,
                {
                    char: "111",
                    bg: "rgb(0, 0, 0)",
                    fg: "rgb(128, 128, 128)",
                    walkable: 1,
                },
            ],
        ],
    },
};

export type BUILDING_KEYS = keyof typeof BUILDING_DATA;

//ensures that all Enums in MENU_ID are
//included in either MENU_DATA or BUILDING_DATA
export const ALL_MENU_DATA: Record<MENU_ID, IMenuItem> = {
    ...MENU_DATA as Record<MENU_KEYS, IMenuItem>,
    ...BUILDING_DATA as Record<BUILDING_KEYS, IMenuItem>,
};

Object.keys(ALL_MENU_DATA).forEach((val) => {
    ALL_MENU_DATA[val].id = val;
});
