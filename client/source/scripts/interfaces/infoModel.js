
const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

module.exports = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Tournament Info"
        this.type = Enums.EInterface.info
    }

    init() {

        this.refreshTournamentInfoList().then(() => {
            if (MainStore.startupTournamentName) {
                for (let info of MainStore.tournamentInfoList) {
                    let tournamentName = info.tournamentName || info.TournamentName
                    if (tournamentName === MainStore.startupTournamentName) {
                        this.setInfo(info)
                        break
                    }
                }

                MainStore.startupTournamentName = undefined
            }
        })
    }

    setInfo(info) {
        let saveData = DataAction.loadDataFromDynamo(info)
        if (saveData !== undefined) {
            MainStore.tournamentName = info.tournamentName
            MainStore.saveData = saveData
        }
    }

    refreshTournamentInfoList() {
        return fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getActiveTournaments",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            return response.json()
        }).then((response) => {
            this.setTournamentInfoList(response.tournamentInfos)
        }).catch((error) => {
            console.log("Refresh Tournament Info Error", error)
        })
    }

    setTournamentInfoList(infos) {
        MainStore.tournamentInfoList = infos
    }

    getPoolResults(poolData) {
        return fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPoolResults?tournamentName=${MainStore.tournamentName}&divisionIndex=${poolData.divisionIndex}&roundIndex=${poolData.roundIndex}&poolIndex=${poolData.poolIndex}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            return response.json()
        }).then((response) => {
            poolData.results = response
        }).catch((error) => {
            console.log("Refresh Tournament Info Error", error)
        })
    }
}
