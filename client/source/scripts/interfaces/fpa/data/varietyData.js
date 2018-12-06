
const Mobx = require("mobx")

const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")

class TeamVarietyScores {
    constructor() {
        this.quantityScore = 0
        this.qualityScore = 4
    }
}

module.exports.DataClass = class extends DataStore.ResultsDataBase {
    constructor(poolData) {
        super(Enums.EInterface.variety, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamVarietyScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)
    }

    setScores(teamIndex, quantity, quality) {
        this.setQuantityScore(quantity)
        this.setQualityScore(quality)
    }

    setQuantityScore(teamIndex, quantity) {
        this.teamScoreList[teamIndex].quantityScore = quantity
    }

    setQualityScore(teamIndex, quality) {
        this.teamScoreList[teamIndex].qualityScore = quality
    }
}

module.exports.verify = function(resultsData) {
    return resultsData !== undefined && resultsData.type === Enums.EInterface.variety
}

module.exports.getSummary = function(resultsData, teamIndex) {
    if (module.exports.verify(resultsData)) {
        let team = resultsData.teamScoreList[teamIndex]
        return team.quantityScore * team.qualityScore / 100
    }

    return undefined
}
