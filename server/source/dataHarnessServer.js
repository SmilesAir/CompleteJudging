
const DataManager = require("../source/dataManager.js")

module.exports.getTournamentKey = function(tournamentName) {
    return DataManager.getTournamentKey(tournamentName)
}

module.exports.getPoolItem = function(poolKey) {
    return DataManager.getPoolItem(poolKey)
}

module.exports.getResultItem = function(resultsKey) {
    return DataManager.getResultItem(resultsKey)
}
