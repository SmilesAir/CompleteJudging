
const Mobx = require("mobx")
const uuid4 = require("uuid/v4")

const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

module.exports = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Head Judge"
        this.type = Enums.EInterface.head

        this.playingPoolKey = undefined

        this.obs = Mobx.observable({
            routineLengthSeconds: 60,
            playingPool: undefined,
            playingTeamIndex: undefined
        })
    }

    getPoolDataForAWS() {
        return {
            poolHash: uuid4(),
            pool: this.obs.playingPool,
            observableHash: uuid4(),
            observable: {
                routineLengthSeconds: this.obs.routineLengthSeconds,
                playingTeamIndex: this.obs.playingTeamIndex
            }
        }
    }

    setPlayingPool(pool) {
        this.obs.playingPool = pool
        this.obs.playingTeamIndex = pool.teamList.length > 0 ? 0 : undefined

        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/setPlayingPool",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tournamentName: MainStore.tournamentName,
                    data: this.getPoolDataForAWS()
                })
            }).then((response) => {
            return response.json()
        }).then((response) => {
            if (response.status < 400) {
                this.playingPoolKey = response.playingPoolKey
            }
        }).catch((error) => {
            console.log("Error: Set Playing Pool", error)
        })
    }
}
