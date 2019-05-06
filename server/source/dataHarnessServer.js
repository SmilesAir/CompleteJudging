
const DataManager = require("../source/dataManager.js")

module.exports.getTournamentKey = function(tournamentName) {
    return DataManager.getTournamentKey(tournamentName)
}

module.exports.getPoolItem = async function(poolKey) {
    return DataManager.getPoolItem(poolKey)
}
