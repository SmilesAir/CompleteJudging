
const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const ExAiCombinedData = require("scripts/interfaces/fpa/data/exAiCombinedData.js")
const CommonAction = require("scripts/actions/commonAction.js")
const EndpointStore = require("scripts/stores/endpointStore.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Ex/Ai Judge"
        this.type = Enums.EInterface.exAiCombined

        this.playPoolHash = undefined
        this.observableHash = undefined
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
        this.obs.results = new ExAiCombinedData.DataClass(this.obs.playingPool, results)
    }

    incrementMinor(counterKey) {
        CommonAction.vibrateSingleShort()

        let teamResults = this.getActiveResultsData()
        let aiData = teamResults.getAiData(counterKey)
        ++aiData.minorCount

        return aiData.minorCount
    }

    incrementMajor(counterKey) {
        CommonAction.vibrateSingleMedium()

        let teamResults = this.getActiveResultsData()
        let aiData = teamResults.getAiData(counterKey)
        ++aiData.majorCount

        return aiData.majorCount
    }

    incrementDeduction(point) {
        CommonAction.vibrateSingleShort()

        let teamResults = this.getActiveResultsData()
        let newCount = teamResults.getPointCount(point) + 1
        teamResults.setPointCount(point, newCount)

        this.reportScores()
        
        return newCount
    }

    decrementDeduction(point) {
        CommonAction.vibrateDoubleShort()

        let teamResults = this.getActiveResultsData()
        let newCount = Math.max(0, teamResults.getPointCount(point) - 1)
        teamResults.setPointCount(point, newCount)

        this.reportScores()
        
        return newCount
    }

    setAiScore(value, key) {
        let teamResults = this.getActiveResultsData()
        teamResults.getAiData(key).score = value

        this.reportScores()
    }
}

