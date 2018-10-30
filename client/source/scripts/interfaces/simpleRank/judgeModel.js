
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const DataStore = require("scripts/stores/dataStore.js")

module.exports = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Rank Judge"
        this.type = Enums.EInterface.rank

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            playingPool: undefined,
            routineLengthSeconds: undefined,
            playingTeamIndex: undefined
        })
    }

    init() {
        fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPlayingPool?tournamentName=${MainStore.startupTournamentName}`,
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
            this.obs.playingPool = new DataStore.PoolData(response.pool)
            this.obs.routineLengthSeconds = response.observable.routineLengthSeconds
            this.obs.playingTeamIndex = response.observable.playingTeamIndex
            this.playPoolHash = response.playPoolHash
            this.observableHash = response.observableHash
        }).catch((error) => {
            console.log("Error: Set Playing Pool", error)
        })
    }
}
