function flattenArray(array) {
    return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []);
}

module.exports = flattenArray;
