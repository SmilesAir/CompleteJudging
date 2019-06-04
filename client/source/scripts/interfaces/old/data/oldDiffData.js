
const Mobx = require("mobx")

const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")
const DataBase = require("scripts/stores/dataBase.js")

module.exports.getDefaultConstants = function() {
    return {
        name: "oldDiff"
    }
}

class TeamDiffScores extends DataBase.class {
    constructor(blockCount) {
        super()

        this.scores = Mobx.observable(new Array(blockCount))
    }

    setScore(blockIndex, score) {
        this.scores[blockIndex] = score
    }
}

module.exports.DataClass = class extends DataStore.ResultsDataBase {
    constructor(poolData, results, routineLengthSeconds) {
        super(Enums.EInterface.diff, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamDiffScores(Math.floor(routineLengthSeconds / 15)))
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)

        if (results !== undefined) {
            for (let resultIndex = 0; resultIndex < results.teamScoreList.length; ++resultIndex) {
                let data = results.teamScoreList[resultIndex]

                this.setGeneral(resultIndex, data.general)

                for (let blockIndex = 0; blockIndex < data.scores.length; ++blockIndex) {
                    this.setScore(resultIndex, blockIndex, data.scores[blockIndex])
                }
            }
        }
    }

    setScore(teamIndex, blockIndex, score) {
        this.teamScoreList[teamIndex].setScore(blockIndex, score)
    }
}

module.exports.verify = function(resultsData) {
    return resultsData !== undefined && resultsData.type === Enums.EInterface.diff
}

function getDiffScore(inScores) {
    if (inScores.length === 0) {
        return 0
    }

    let scores = inScores.slice(0)
    scores.sort((a, b) => {
        return a - b
    })

    scores.splice(0, 1)

    let total = 0
    for (let score of scores) {
        total += score
    }

    return total / scores.length
}

module.exports.getSummary = function(resultsData, teamIndex) {
    if (module.exports.verify(resultsData)) {
        return `D: ${getDiffScore(scoreList.scores).toFixed(2)}`
    }

    return undefined
}

module.exports.getOverlaySummary = function(data) {
    return ` [Difficulty: ${getDiffScore(data.scores).toFixed(2)}]`
}

module.exports.getFullProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Score: getDiffScore(data.scores)
    })

    return processed
}

module.exports.getIncrementalScoreboardProcessed = function(data, preProcessedData, processedData) {
    return module.exports.getScoreboardProcessed(data, preProcessedData, processedData)
}

module.exports.getScoreboardProcessed = function(data, preProcessedData, processedData) {
    processedData.diff = getDiffScore(data.scores)

    return undefined
}

module.exports.getCategoryResultsProcessed = function(data, preProcessedData, processedData) {
    processedData.diff = getDiffScore(data.scores)

    return undefined
}

module.exports.getDiffDetailedProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Marks: data.scores.join(" ")
    })
    processed.push({
        Score: getDiffScore(data.scores)
    })

    return processed
}
