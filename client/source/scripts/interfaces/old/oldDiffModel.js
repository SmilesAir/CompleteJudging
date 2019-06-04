

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const OldDiffData = require("scripts/interfaces/old/data/oldDiffData.js")
const CommonAction = require("scripts/actions/commonAction.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Old Diff Judge"
        this.type = Enums.EInterface.oldDiff

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs.dragTeamIndex = undefined
        this.obs.editIndex = undefined
        this.obs.activeInputIndex = undefined
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
        this.obs.results = new OldDiffData.DataClass(this.obs.playingPool, results, this.obs.routineLengthSeconds)
    }

    setActiveScore(score) {
        if (this.obs.activeInputIndex !== undefined) {
            this.obs.results.setScore(this.getActiveTeamIndex(), this.obs.activeInputIndex, score)

            this.reportScores()
        }
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

    onRoutineStart() {
        super.onRoutineStart()

        this.obs.activeInputIndex = undefined
    }

    onRoutineUpdate() {
        super.onRoutineUpdate()

        this.obs.activeInputIndex = undefined

        let scores = this.obs.results.teamScoreList[this.getActiveTeamIndex()].scores
        let activeIndex = Math.min(Math.floor(MainStore.routineTimeMs / 15000) - 1, scores.length - 1)
        if (activeIndex >= 0) {
            let score = scores[activeIndex]

            if (score === null || score === undefined) {
                this.obs.activeInputIndex = activeIndex
            }
        }
    }

    onRoutineStop() {
        super.onRoutineStop()

        this.obs.activeInputIndex = undefined
    }
}
