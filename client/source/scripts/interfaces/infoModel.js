
const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const CommonAction = require("scripts/actions/commonAction.js")

module.exports = class extends InterfaceModelBase {
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
        return CommonAction.fetchEx("GET_ACTIVE_TOURNAMENTS", undefined, undefined, {
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

    importTournamentDataFromAWS(info) {
        return CommonAction.fetchEx("IMPORT_TOURNAMENT_DATA", {
            tournamentName: info.tournamentName
        }, undefined, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            console.log(response)
        }).catch((error) => {
            console.log("Import Tournament Info Error", error)
        })
    }
}
