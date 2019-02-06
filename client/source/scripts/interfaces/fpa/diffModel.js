

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DiffData = require("scripts/interfaces/fpa/data/diffData.js")
const CommonAction = require("scripts/actions/commonAction.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Diff Judge"
        this.type = Enums.EInterface.diff

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs.dragTeamIndex = undefined
        this.obs.editIndex = undefined
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

    createResultsData(results) {
        this.obs.results = new DiffData.DataClass(this.obs.playingPool, results)
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
            }
        ).catch((error) => {
            console.log("Report Scores Error:", error)
        })
    }

    addScore(score) {
        this.obs.results.addScore(this.getActiveTeamIndex(), score)

        this.reportScores()
    }

    startEdit(markIndex) {
        this.obs.editIndex = markIndex
    }

    endEdit(score) {
        if (score !== undefined && this.obs.editIndex !== undefined) {
            this.obs.results.teamScoreList[this.getActiveTeamIndex()].scores[this.obs.editIndex] = score

            CommonAction.vibrateSingleMedium()

            this.reportScores()
        }

        this.obs.editIndex = undefined
    }
}
