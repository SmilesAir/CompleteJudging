
const React = require("react")
const Mobx = require("mobx")

const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")

module.exports.getDefaultConstants = function() {
    return {
        name: "diff",
        offset: -3,
        power: 1.5,
        scale: 1 / 1.9,
        top: 3
    }
}

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

function getAverage(scores, adjusted) {
    let avg = 0
    for (let score of scores) {
        avg += adjusted ? getAdjustedScore(score) : score
    }
    return avg / scores.length
}

function getTopAverage(inScores, topNum, adjusted) {
    let scores = inScores.slice(0)
    scores.sort((a, b) => {
        if (a > b) {
            return 1
        }
        if (b > a) {
            return -1
        }
        return 0
    })

    return getAverage(scores.slice(scores.length - topNum), adjusted)
}

function getAdjustedScore(score) {
    let constants = MainStore.constants.diff
    return Math.pow(Math.max(0, score + constants.offset), constants.power) * constants.scale
}

module.exports.getInspected = function(resultData, teamIndex) {
    if (module.exports.verify(resultData.data)) {
        let str = resultData.judgeName + " - "

        let scores = resultData.data.teamScoreList[teamIndex].scores
        str += scores.join(" ")

        let constants = MainStore.constants.diff
        let top = constants.top
        str += ` Raw: ${getAverage(scores, false).toFixed(2)} Top (${top}): ${getTopAverage(scores, top, false).toFixed(2)}`
        str += ` Adj Raw: ${getAverage(scores, true).toFixed(2)} Adj Top (${top}): ${getTopAverage(scores, top, true).toFixed(2)}`
        str += ` Adj Sum Raw: ${getAdjustedScore(getAverage(scores, false)).toFixed(2)} Adj Sum Top (${top}): ${getAdjustedScore(getTopAverage(scores, top, false)).toFixed(2)}`

        return (
            <div key={teamIndex}>{str}</div>
        )
    }

    return undefined
}
