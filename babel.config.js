const presets = [
    [
        "@babel/preset-env",
        {
            targets: [">0.25%", "not ie 11"],
            useBuiltIns: "usage"
        },
        "@babel/preset-typescript",
        {
            isTSX: true,
            jsxPragma: "h",
            allExtensions: true
        }
    ],
];

module.exports = { presets };
