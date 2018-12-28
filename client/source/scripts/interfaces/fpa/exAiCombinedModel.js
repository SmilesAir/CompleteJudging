
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const ExAiCombinedData = require("scripts/interfaces/fpa/data/exAiCombinedData.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Ex/Ai Judge"
        this.type = Enums.EInterface.exAiCombined

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            playingPool: undefined,
            routineLengthSeconds: undefined,
            playingTeamIndex: undefined,
            results: undefined
        })
    }

    init() {
        super.init()

        if (MainStore.startupTournamentName !== undefined) {
            this.queryPoolData(MainStore.startupTournamentName)
        }

        setInterval(() => {
            this.queryPoolData(MainStore.tournamentName)
        }, this.updateIntervalMs)
    }

    updateFromAws(awsData) {
        let dirty = super.updateFromAws(awsData)
        
        if (dirty.poolDirty) {
            this.obs.results = new ExAiCombinedData.DataClass(this.obs.playingPool)
        }
    }

    reportScores() {
        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/reportJudgeScore",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tournamentName: MainStore.tournamentName,
                    judgeId: MainStore.userId,
                    results: this.obs.results
                })
            }).catch((error) => {
            console.log("Report Scores Error:", error)
        })
    }

    getActiveResultsData() {
        return this.obs.results.teamScoreList[this.obs.playingTeamIndex]
    }

    incrementDeduction(point) {
        let teamResults = this.getActiveResultsData()
        let newCount = teamResults.getPointCount(point) + 1
        teamResults.setPointCount(point, newCount)

        this.reportScores()
        
        return newCount
    }

    decrementDeduction(point) {
        let teamResults = this.getActiveResultsData()
        let newCount = Math.max(0, teamResults.getPointCount(point) - 1)
        teamResults.setPointCount(point, newCount)

        this.reportScores()
        
        return newCount
    }
}

