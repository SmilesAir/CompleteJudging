
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")
const DataAction = require("scripts/actions/dataAction.js")

class InterfaceModelBase {
    constructor() {
        this.type = Enums.EInterface.invalid
        this.updateIntervalMs = 3000

        this.obs = Mobx.observable({
            routineLengthSeconds: 60,
            playingPool: undefined,
            playingTeamIndex: undefined,
            editTeamIndex: undefined,
            results: undefined
        })
    }

    init() {
        if (this.obs !== undefined) {
            this.setObs(this.obs)
        }
    }

    setObs(obs) {
        MainStore.interfaceObs = obs
    }

    updateFromAws(awsData) {
        let poolDirty = this.playPoolHash !== awsData.poolHash
        let obsDirty = this.observableHash !== awsData.observableHash
        if (poolDirty) {
            this.playPoolHash = awsData.poolHash
            this.obs.playingPool = new DataStore.PoolData(awsData.pool)
        }

        if (obsDirty) {
            this.observableHash = awsData.observableHash
            this.obs.routineLengthSeconds = awsData.observable.routineLengthSeconds
            if (this.obs.playingTeamIndex !== awsData.observable.playingTeamIndex) {
                this.obs.playingTeamIndex = awsData.observable.playingTeamIndex

                this.fillWithResults()
            }

            if (this.obs.startTime === undefined && awsData.observable.startTime !== undefined) {
                this.obs.startTime = awsData.observable.startTime
                this.onRoutineStart()
            } else if (this.obs.startTime !== undefined && awsData.observable.startTime === undefined) {
                this.obs.startTime = undefined
                this.onRoutineStop()
            } else {
                this.obs.startTime = awsData.observable.startTime
            }
        }

        if (awsData.serverTime !== undefined) {
            MainStore.serverTimeOffset = awsData.serverTime - Date.now()
        }

        return {
            poolDirty: poolDirty,
            obsDirty: obsDirty
        }
    }

    updateResultsFromAws(results) {
        if (this.obs.results === undefined) {
            let foundResults = false
            for (let result of results) {
                if (result.judgeName === MainStore.userId) {
                    foundResults = true

                    this.createResultsData(result.data)
                }
            }

            if (foundResults) {
                this.fillWithResults()
            } else {
                this.createResultsData()
            }
        }
    }

    queryPoolData(tournamentName) {
        let awsData = undefined
        fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPlayingPool?tournamentName=${tournamentName}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((response) => {
            if (response.status < 400) {
                return response.json()
            } else {
                throw new Error(response.statusText)
            }
        }).then((response) => {
            awsData = response
            let pool = awsData.pool
            return DataAction.getPoolResults(pool.divisionIndex, pool.roundIndex, pool.poolIndex)
        }).then((results) => {
            this.updateFromAws(awsData)
            this.updateResultsFromAws(results)
        }).catch((error) => {
            console.log("Error: Set Playing Pool", error)
        })
    }

    getRoutineTimeMs() {
        return MainStore.routineTimeMs
    }

    onRoutineStart() {
        if (this.routineUpdateHandle !== undefined) {
            clearInterval(this.routineUpdateHandle)
        }

        this.routineUpdateHandle = setInterval(() => {
            this.onRoutineUpdate()
        }, 200)
    }

    onRoutineUpdate() {
        MainStore.routineTimeMs = this.obs.startTime !== undefined ? Date.now() - this.obs.startTime + MainStore.serverTimeOffset : undefined
    }

    onRoutineStop() {
        clearInterval(this.routineUpdateHandle)
    }

    isEditing() {
        return this.obs.editTeamIndex !== undefined
    }

    getCurrentTeamString() {
        let teamIndex = this.getActiveTeamIndex()
        if (this.obs.playingPool !== undefined && teamIndex !== undefined) {
            return `[${DataAction.getTeamPlayers(this.obs.playingPool.teamList[teamIndex], ", ")}]`
        }

        return undefined
    }

    fillWithResults() {
        if (this.fillWithResultsFunc !== undefined) {
            this.fillWithResultsFunc()
        } else {
            console.error(`${this.name} view missing fillWithResultsFunc`)
        }
    }

    createResultsData() {
        console.error(`${this.name} view missing override createResultsData`)
    }

    getActiveResultsData() {
        return this.obs.results && this.obs.results.teamScoreList[this.getActiveTeamIndex()]
    }

    getActiveTeamIndex() {
        return this.isEditing() ? this.obs.editTeamIndex : this.obs.playingTeamIndex
    }
}
module.exports = InterfaceModelBase
