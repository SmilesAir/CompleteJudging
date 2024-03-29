
const React = require("react")
const Mobx = require("mobx")

const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")
const DataBase = require("scripts/stores/dataBase.js")
const LocStore = require("scripts/stores/locStore.js")

const epsilon = .01

module.exports.getDefaultConstants = function() {
    // https://www.desmos.com/calculator/fcipcuyc8f
    return {
        name: "diff",
        diffScaler: 2,
        offset: 0,
        power: 1.5,
        scale: .5,
        topPerSecond: .066667,
        gradientLines: [
            {
                sCountPerSecond: 0,
                eCountPerSecond: 4 / 60,
                sY: 1,
                eY: 1
            },
            {
                sCountPerSecond: 4 / 60,
                eCountPerSecond: 8 / 60,
                sY: .3,
                eY: .1
            },
            {
                sCountPerSecond: 8 / 60,
                eCountPerSecond: 16 / 60,
                sY: .1,
                eY: 0
            },
            {
                sCountPerSecond: 0,
                eCountPerSecond: Infinity,
                sY: 0,
                eY: 0
            }
        ]
    }
}

class TeamDiffScores extends DataBase.class {
    constructor() {
        super()

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

                this.setGeneral(resultIndex, data.general)

                if (data.scores !== undefined) {
                    for (let score of data.scores) {
                        this.addScore(resultIndex, score)
                    }
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

        let count = Math.max(1, getPhraseCount(scoreList.scores))
        return `D: ${(sum / count).toFixed(2)}`
    }

    return undefined
}

module.exports.getOverlaySummary = function(data) {
    return ` [Phrases: ${getPhraseCount(data.scores)}, Raw: ${getAverage(data.scores, data.scores.length, false).toFixed(1)}, G: ${data.general}]`
}

module.exports.getHeaderSummary = function(data) {
    return `[${getAverage(data.scores, data.scores.length, false).toFixed(1)}]`
}

function getAverage(scores, count, adjusted) {
    let avg = 0
    for (let score of scores) {
        avg += adjusted ? getAdjustedScore(score) : score
    }

    return avg / Math.max(1, count)
}

function sortScores(inScores) {
    let scores = inScores.slice(0)
    scores.sort((a, b) => {
        return b - a
    })

    return scores
}

function getTopAverage(inScores, adjusted, routineLengthSeconds) {
    let scores = sortScores(inScores)

    let top = Math.round(MainStore.constants.diff.topPerSecond * routineLengthSeconds)
    return getAverage(scores.slice(Math.max(0, getPhraseCount(scores) - top)), top, adjusted)
}

function getAdjustedScore(score) {
    let constants = MainStore.constants.diff
    return Math.pow(Math.max(0, score + constants.offset), constants.power) * constants.scale
}

function generateGradientArray(count, routineLengthSeconds) {
    let gradientArray = []
    for (let i = 0; i < count; ++i) {
        for (let line of MainStore.constants.diff.gradientLines) {
            let sX = line.sCountPerSecond * routineLengthSeconds - epsilon
            let eX = line.eCountPerSecond * routineLengthSeconds + epsilon
            if (i >= sX && i < eX) {
                let dx = i - sX
                let slope = (line.eY - line.sY) / (eX - sX)
                gradientArray.push(line.sY + slope * dx)
                break
            }
        }
    }

    return gradientArray
}

function getGradientScore(data, adjusted, routineLengthSeconds, reportTier1Only) {
    let sortedScores = sortScores(data.scores)
    let gradientArray = generateGradientArray(sortedScores.length, routineLengthSeconds)
    let totalScore = 0
    for (let i = 0; i < sortedScores.length; ++i) {
        if (reportTier1Only !== true || gradientArray[i] > .9) {
            let score = sortedScores[i]
            totalScore += (adjusted ? getAdjustedScore(score) : score) * gradientArray[i]
        }
    }

    return totalScore / (4 / 60 * routineLengthSeconds) * MainStore.constants.diff.diffScaler
}

module.exports.getInspected = function(resultData, teamIndex) {
    if (module.exports.verify(resultData.data)) {
        let str = resultData.judgeName + " - "

        let scores = resultData.data.teamScoreList[teamIndex].scores
        str += scores.join(" ")

        let top = Math.round(constants.topPerSecond * 180)
        str += ` ${LocStore.Raw}: ${getAverage(scores, top, false).toFixed(2)} ${LocStore.Top} (${top}): ${getTopAverage(scores, false).toFixed(2)}`
        str += ` ${LocStore.AdjustedRaw}: ${getAverage(scores, top, true).toFixed(2)} ${LocStore.AdjustedTop} (${top}): ${getTopAverage(scores, true).toFixed(2)}`
        str += ` ${LocStore.AdjustedSumRaw}: ${getAdjustedScore(getAverage(scores, top, false)).toFixed(2)} ${LocStore.AdjustedSumTop} (${top}): ${getAdjustedScore(getTopAverage(scores, false)).toFixed(2)}`

        return (
            <div className="inspectedResults" key={teamIndex}>{str}</div>
        )
    }

    return undefined
}

module.exports.getFullProcessed = function(data, preProcessedData) {
    let markList = data.scores.slice(0)
    while (markList.length < preProcessedData.routineLengthSeconds * MainStore.constants.diff.gradientLines[0].eCountPerSecond - epsilon) {
        markList.push(0)
    }

    let gradientArray = generateGradientArray(markList.length, preProcessedData.routineLengthSeconds)
    let sortedMarks = sortScores(markList)

    let sumNormal = 0
    let sumTier1 = 0
    let sumTier1Adjusted = 0
    let tier1Count = 0
    for (let i = 0; i < sortedMarks.length; ++i) {
        let mark = sortedMarks[i]
        sumNormal += mark
        if (gradientArray[i] > .9) {
            sumTier1 += mark
            sumTier1Adjusted += getAdjustedScore(mark)
            ++tier1Count
        }
    }
    let averageNormal = sumNormal /= sortedMarks.length
    let averageTier1 = sumTier1 /= tier1Count
    let averageTier1Adjusted = getGradientScore(data, true, preProcessedData.routineLengthSeconds, true)

    let markTierList = []
    for (let mark of markList) {
        let index = sortedMarks.findIndex((a) => {
            return a === mark
        })

        sortedMarks[index] = undefined

        markTierList.push(gradientArray[index] > .9 ? 0 : 1)
    }

    let generalPoints = DataBase.calcCommonScore(data)
    let score = getGradientScore(data, true, preProcessedData.routineLengthSeconds) + generalPoints

    return {
        type: Enums.EInterface.diff,
        phrases: getPhraseCount(markList),
        general: data.general,
        generalPoints: generalPoints,
        marks: markList,
        markTierList: markTierList,
        averageNormal: averageNormal,
        averageTier1: averageTier1,
        averageTier1Adjusted: averageTier1Adjusted,
        phraseCount: getPhraseCount(markList),
        score: score,
        tail: score - averageTier1Adjusted - generalPoints,
        categoryOnlyScore: (score - generalPoints).toFixed(1)
    }
}

module.exports.getIncrementalScoreboardProcessed = function(data, preProcessedData) {
    return module.exports.getScoreboardProcessed(data, preProcessedData)
}

module.exports.getScoreboardProcessed = function(data, preProcessedData) {
    return {
        phrases: preProcessedData.totalPhraseCount,
        diff: getGradientScore(data, true, preProcessedData.routineLengthSeconds)
    }
}

module.exports.getCategoryResultsProcessed = function(data, preProcessedData, processedData) {
    processedData.diff = (processedData.diff || 0) + getGradientScore(data, true, preProcessedData.routineLengthSeconds)

    return undefined
}

module.exports.getDiffDetailedProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Marks: data.scores.join(" ")
    })
    processed.push({
        Phrases: getPhraseCount(data.scores)
    })
    processed.push({
        G: data.general
    })
    processed.push({
        Raw: getAverage(data.scores, data.scores.length, false)
    })
    processed.push({
        Score: getGradientScore(data, true, preProcessedData.routineLengthSeconds)
    })

    return processed
}

module.exports.getHudProcessed = function(data, preProcessedData, processedData) {
    processedData.diff = getGradientScore(data, true, preProcessedData.routineLengthSeconds)
}

module.exports.getPreProcessed = function(data, preProcessedData) {
    preProcessedData.totalPhraseCount = (preProcessedData.totalPhraseCount || 0) + getPhraseCount(data.scores)
    preProcessedData.diffJudgeCount = (preProcessedData.diffJudgeCount || 0) + 1
}

function getPhraseCount(scoreList) {
    let count = 0
    for (let score of scoreList) {
        if (score > 0) {
            ++count
        }
    }

    return count
}
