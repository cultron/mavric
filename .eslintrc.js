module.exports = {
    //"extends": "airbnb-base",
    //"plugins": [
    //    "import"
    //]
    "extends": "eslint:all",
    "rules": {
        // override default options
        "comma-dangle": ["error", "always"],
        "indent": ["error", 2],
        "no-cond-assign": ["error", "always"],

        // disable now, but enable in the future
        "one-var": "off", // ["error", "never"]

        // disable
        "init-declarations": "off",
        "no-console": "off",
        "no-inline-comments": "off",
        "no-var": "off",
        "dot-location": "off",
        "capitalized-comments": "off",
        "spaced-comment": "off"
    }
};