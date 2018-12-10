
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")
const DataAction = require("scripts/actions/dataAction.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Diff Results Inspector"
        this.type = Enums.EInterface.diffInspector

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
            this.queryIntervalHandle = setInterval(() => {
                if (MainStore.saveData !== undefined) {
                    this.queryPoolData(MainStore.tournamentName)

                    clearInterval(this.queryIntervalHandle)
                }
            }, 200)
        }
    }

    queryPoolData(tournamentName) {
        fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPlayingPool?tournamentName=${tournamentName}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            if (response.status < 400) {
                return response.json()
            } else {
                throw new Error(response.statusText)
            }
        }).then((response) => {
            this.updateFromAws(response)
        }).catch((error) => {
            console.log("Error: Query Playing Pool", error)
        })
    }

    updateFromAws(awsData) {
        if (MainStore.saveData === undefined) {
            return
        }

        if (this.playPoolHash !== awsData.poolHash) {
            this.playPoolHash = awsData.poolHash
            this.obs.playingPool = new DataStore.PoolData(awsData.pool)

            DataAction.getPoolResults(this.obs.playingPool).then(() => {
                this.obs.results = this.obs.playingPool.results
            })
        }

        if (this.observableHash !== awsData.observableHash) {
            this.observableHash = awsData.observableHash
            this.obs.routineLengthSeconds = awsData.observable.routineLengthSeconds
            this.obs.playingTeamIndex = awsData.observable.playingTeamIndex
        }
    }
}

