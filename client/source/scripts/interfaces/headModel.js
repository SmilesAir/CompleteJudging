
const Mobx = require("mobx")
const uuid4 = require("uuid/v4")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Head Judge"
        this.type = Enums.EInterface.head

        this.playingPoolKey = undefined
        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            routineLengthSeconds: 60,
            playingPool: undefined,
            playingTeamIndex: undefined
        })

        this.awsData = undefined
    }

    init() {
        super.init()

        if (MainStore.startupTournamentName !== undefined) {
            this.queryPoolData(MainStore.startupTournamentName)
        }
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
        if (this.obs.playingPool !== pool) {
            this.obs.playingPool = pool
            this.obs.playingTeamIndex = pool.teamList.length > 0 ? 0 : undefined

            this.awsData = this.getPoolDataForAWS()
        }

        this.sendDataToAWS()
    }

    setPlayingTeam(teamData) {
        let index = this.obs.playingPool.teamList.indexOf(teamData)
        if (index !== -1) {
            if (this.obs.playingTeamIndex !== index) {
                this.obs.playingTeamIndex = index
                this.awsData.observable.playingTeamIndex = index
                this.awsData.observableHash = uuid4()

                this.sendDataToAWS()
            }
        }
    }

    updateFromAws(awsData) {
        this.obs.playingPool = new DataStore.PoolData(awsData.pool)
        this.obs.playingTeamIndex = awsData.observable.playingTeamIndex

        this.awsData = awsData
    }

    sendDataToAWS() {
        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/setPlayingPool",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tournamentName: MainStore.tournamentName,
                    data: this.awsData
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
