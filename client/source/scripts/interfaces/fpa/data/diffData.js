
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
        top: 6
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
    constructor(poolData, results) {
        super(Enums.EInterface.diff, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamDiffScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)

        if (results !== undefined) {
            for (let resultIndex = 0; resultIndex < results.teamScoreList.length; ++resultIndex) {
                let data = results.teamScoreList[resultIndex]
                for (let score of data.scores) {
                    this.addScore(resultIndex, score)
                }
            }
        }
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
        return `D: ${(sum / count).toFixed(2)}`
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

function getTopAverage(inScores, adjusted, routineLengthSeconds) {
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

    let top = MainStore.constants.diff.top * routineLengthSeconds / 180
    return getAverage(scores.slice(scores.length - top), adjusted)
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

        let top = constants.top
        str += ` Raw: ${getAverage(scores, false).toFixed(2)} Top (${top}): ${getTopAverage(scores, false).toFixed(2)}`
        str += ` Adj Raw: ${getAverage(scores, true).toFixed(2)} Adj Top (${top}): ${getTopAverage(scores, true).toFixed(2)}`
        str += ` Adj Sum Raw: ${getAdjustedScore(getAverage(scores, false)).toFixed(2)} Adj Sum Top (${top}): ${getAdjustedScore(getTopAverage(scores, false)).toFixed(2)}`

        return (
            <div className="inspectedResults" key={teamIndex}>{str}</div>
        )
    }

    return undefined
}

module.exports.getFullProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Phrases: data.scores.length
    })
    processed.push({
        Score: getTopAverage(data.scores, true, preProcessedData.routineLengthSeconds)
    })

    return processed
}

module.exports.getScoreboardProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Phrases: data.scores.length
    })
    processed.push({
        Score: getTopAverage(data.scores, true, preProcessedData.routineLengthSeconds)
    })

    return processed
}

module.exports.getPreProcessed = function(data, preProcessedData) {
    preProcessedData.totalPhraseCount = (preProcessedData.phraseCount || 0) + data.scores.length
    preProcessedData.diffJudgeCount = (preProcessedData.diffJudgesCount || 0) + 1
}
