
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

    async init() {
        if (!MainStore.lanMode) {
            this.refreshTournamentInfoList().then(() => {
                if (MainStore.startupTournamentName !== undefined) {
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
        } else if (MainStore.startupTournamentName !== undefined) {
            let info = await this.getTournamentInfoFromServer(MainStore.startupTournamentName)
            this.setInfo(info)

            MainStore.startupTournamentName = undefined
        }
    }

    setInfo(info) {
        let saveData = DataAction.loadDataFromPoolCreator(info)
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
        return CommonAction.fetchEx("REQUEST_IMPORT_TOURNAMENT_DATA", {
            tournamentName: info.tournamentName
        }, undefined, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            console.log(response)
        }).catch((error) => {
            console.log("Import Tournament Data Error", error)
        })
    }

    getTournamentInfoFromServer(tournamentName) {
        return CommonAction.fetchEx("REQUEST_TOURNAMENT_INFO", {
            tournamentName: tournamentName
        }, undefined, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            console.log(response)
            return response
        }).catch((error) => {
            console.log("Import Tournament Data Error", error)
        })
    }

    exportTournamentData() {
        return CommonAction.fetchEx("REQUEST_EXPORT_TOURNAMENT_DATA", {
            tournamentName: MainStore.tournamentName
        }, undefined, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).catch((error) => {
            console.log("Export Tournament Data Error", error)
        })
    }
}
