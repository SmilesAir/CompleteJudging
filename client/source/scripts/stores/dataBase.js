
const MainStore = require("scripts/stores/mainStore.js")

module.exports.getDefaultConstants = function() {
    return {
        name: "base",
        generalScaler: .25
    }
}

module.exports.class = class DataBase {
    constructor() {
        this.general = 0
    }
}

module.exports.calcCommonScore = function(data) {
    return data.general !== undefined ? data.general * MainStore.constants.base.generalScaler : 0
}
