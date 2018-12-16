

const Enums = require("scripts/stores/enumStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")

class InterfaceModelBase {
    constructor() {
        this.type = Enums.EInterface.invalid
        this.updateIntervalMs = 5000
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
            }).then((response) => {
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
}
module.exports = InterfaceModelBase
