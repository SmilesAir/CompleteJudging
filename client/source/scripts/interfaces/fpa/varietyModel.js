
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const VarietyData = require("scripts/interfaces/fpa/data/varietyData.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Variety Judge"
        this.type = Enums.EInterface.variety

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            playingPool: undefined,
            routineLengthSeconds: undefined,
            playingTeamIndex: undefined,
            results: undefined,
            dragTeamIndex: undefined,
            editIndex: undefined
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
            this.obs.results = new VarietyData.DataClass(this.obs.playingPool)
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

    setQualityScore(score) {
        this.obs.results.setQualityScore(this.obs.playingTeamIndex, score)

        this.reportScores()
    }

    setQuantityScore(score) {
        this.obs.results.setQuantityScore(this.obs.playingTeamIndex, score)

        this.reportScores()
    }
}

