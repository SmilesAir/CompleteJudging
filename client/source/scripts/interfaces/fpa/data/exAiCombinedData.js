
const Mobx = require("mobx")

const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")

module.exports.getDefaultConstants = function() {
    return {
        name: "exAiCombined"
    }
}

class TeamExAiCombinedScores {
    constructor() {
        this.music = {
            score: 0
        }
        this.teamwork = {
            score: 0
        }
        this.general = {
            score: 0
        }
        this.point1Count = 0
        this.point2Count = 0
        this.point3Count = 0
        this.point5Count = 0
    }

    getAiData(key) {
        return this[key]
    }

    getPointCount(number) {
        switch (number) {
        case 1:
            return this.point1Count
        case 2:
            return this.point2Count
        case 3:
            return this.point3Count
        case 5:
            return this.point5Count
        }

        return undefined
    }

    setPointCount(number, count) {
        switch (number) {
        case 1:
            this.point1Count = count
            break
        case 2:
            this.point2Count = count
            break
        case 3:
            this.point3Count = count
            break
        case 5:
            this.point5Count = count
            break
        }
    }
}

module.exports.DataClass = class extends DataStore.ResultsDataBase {
    constructor(poolData, results) {
        super(Enums.EInterface.exAiCombined, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamExAiCombinedScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)

        if (results !== undefined) {
            for (let i = 0; i < results.teamScoreList.length; ++i) {
                let data = results.teamScoreList[i]
                this.setScores(i, data.music, data.teamwork, data.general, data.point1Count, data.point2Count, data.point3Count, data.point5Count)
            }
        }
    }

    setScores(teamIndex, music, teamwork, general, p1, p2, p3, p5) {
        let team = this.teamScoreList[teamIndex]
        team.music = music
        team.teamwork = teamwork
        team.general = general
        team.point1Count = p1
        team.point2Count = p2
        team.point3Count = p3
        team.point5Count = p5
    }
}

module.exports.verify = function(resultsData) {
    return resultsData !== undefined && resultsData.type === Enums.EInterface.exAiCombined
}

module.exports.getTotalDeductions = function(resultsData, teamIndex) {
    let team = resultsData.teamScoreList[teamIndex]
    return calcDeductions(team)
}

function calcAiScore(data) {
    return (data.music.score + data.teamwork.score + data.general.score) / 3
}

// https://www.wolframalpha.com/input/?i=y+%3D+(((50+-+x)+%2F+50)+%5E+2),+x+from+0+to+50
function getExScaler(phraseCount, routineLengthSeconds) {
    if (phraseCount !== undefined && routineLengthSeconds !== undefined) {
        let start = routineLengthSeconds / 180 * 15
        let end = routineLengthSeconds / 180 * 60
        let delta = end - start
        
        return Math.pow((delta - Math.max(0, phraseCount - start)) / delta, 2)
    }

    return 1
}

function calcDeductions(data, phraseCount, routineLengthSeconds) {
    let raw = data.point1Count * .1 + data.point2Count * .2 + data.point3Count * .3 + data.point5Count * .5
    
    return raw * getExScaler(phraseCount, routineLengthSeconds)
}

module.exports.getSummary = function(resultsData, teamIndex) {
    if (module.exports.verify(resultsData)) {
        let team = resultsData.teamScoreList[teamIndex]
        let ai = calcAiScore(team).toFixed(2)
        let ex = module.exports.getTotalDeductions(resultsData, teamIndex).toFixed(2)
        return `A: ${ai} E: ${ex}`
    }

    return undefined
}

module.exports.getFullProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        AI: calcAiScore(data)
    })

    processed.push({
        Ex: calcDeductions(data)
    })
    let adjusted = calcDeductions(data, preProcessedData.totalPhraseCount / Math.max(1, preProcessedData.diffJudgeCount), preProcessedData.routineLengthSeconds)
    processed.push({
        Adj: adjusted
    })

    processed.push({
        Score: calcAiScore(data)
    })

    return processed
}

module.exports.getScoreboardProcessed = function(data, preProcessedData, processedData) {
    processedData.rawEx = (processedData.rawEx || 0) + calcDeductions(data)
    processedData.ex = (processedData.ex || 0) + calcDeductions(data, preProcessedData.totalPhraseCount / Math.max(1, preProcessedData.diffJudgeCount), preProcessedData.routineLengthSeconds)

    return undefined
}

module.exports.getExAiCombinedDetailedProcessed = function(data, preProcessedData) {
    let processed = []

    processed.push({
        Music: data.music.score
    })
    processed.push({
        Team: data.teamwork.score
    })
    processed.push({
        Gen: data.general.score
    })
    processed.push({
        Score: calcAiScore(data)
    })

    processed.push({
        ".1": data.point1Count
    })
    processed.push({
        ".2": data.point2Count
    })
    processed.push({
        ".3": data.point3Count
    })
    processed.push({
        ".5": data.point5Count
    })

    let phraseCount = preProcessedData.totalPhraseCount / Math.max(1, preProcessedData.diffJudgeCount)
    processed.push({
        Scaler: getExScaler(phraseCount, preProcessedData.routineLengthSeconds)
    })

    processed.push({
        Raw: calcDeductions(data)
    })

    let adjusted = calcDeductions(data, phraseCount, preProcessedData.routineLengthSeconds)
    processed.push({
        Adj: adjusted
    })

    return processed
}
