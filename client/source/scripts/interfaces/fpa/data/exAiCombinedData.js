
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
            score: 0,
            minorCount: 0,
            majorCount: 0
        }
        this.teamwork = {
            score: 0,
            minorCount: 0,
            majorCount: 0
        }
        this.general = {
            score: 0,
            minorCount: 0,
            majorCount: 0
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
    constructor(poolData) {
        super(Enums.EInterface.exAiCombined, poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamExAiCombinedScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)
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
    return team.point1Count * .1 + team.point2Count * .2 + team.point3Count * .3 + team.point5Count * .5
}

module.exports.getSummary = function(resultsData, teamIndex) {
    if (module.exports.verify(resultsData)) {
        let team = resultsData.teamScoreList[teamIndex]
        return `A: ${(team.music + team.teamwork + team.general) / 3} E: ${module.exports.getTotalDeductions(resultsData, teamIndex)}`
    }

    return undefined
}
