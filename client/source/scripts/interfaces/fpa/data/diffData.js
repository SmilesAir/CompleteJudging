
const Mobx = require("mobx")

const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")

class TeamDiffScores {
    constructor() {
        this.scores = Mobx.observable([])
    }

    addScore(score) {
        this.scores.push(score)
    }
}

module.exports.DataClass = class extends DataStore.ResultsDataBase {
    constructor(poolData) {
        super(Enums.EInterface.diff, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamDiffScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)
    }

    addScore(teamIndex, score) {
        this.teamScoreList[teamIndex].addScore(score)
    }
}

module.exports.verify = function(resultsData) {
    return resultsData !== undefined && resultsData.type === Enums.EInterface.diff
}

module.exports.getSummary = function(resultsData, teamIndex) {
    if (module.exports.verify(resultsData)) {
        let sum = 0
        let scoreList = resultsData.teamScoreList[teamIndex]
        for (let score of scoreList.scores) {
            sum += score
        }

        let count = Math.max(1, scoreList.scores.length)
        return (sum / count).toFixed(2)
    }

    return undefined
}
