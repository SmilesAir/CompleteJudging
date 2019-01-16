
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
            this.obs.playingTeamIndex = awsData.observable.playingTeamIndex

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

    queryPoolData(tournamentName) {
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
            this.updateFromAws(response)
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
        if (this.obs.playingPool !== undefined) {
            if (this.isEditing()) {
                return `[${DataAction.getTeamPlayers(this.obs.playingPool.teamList[this.obs.editTeamIndex], ", ")}]`
            } else if (this.obs.playingTeamIndex !== undefined) {
                return `[${DataAction.getTeamPlayers(this.obs.playingPool.teamList[this.obs.playingTeamIndex], ", ")}]`
            }
        }

        return undefined
    }
}
module.exports = InterfaceModelBase
