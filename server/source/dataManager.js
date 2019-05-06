
const fetch = require("node-fetch")

const EndpointStore = require("complete-judging-common/source/endpoints.js")


class DataManager {
    constructor() {
        this.tournamentData = undefined
    }

    isInited() {
        return this.tournamentData !== undefined
    }

    async init(tournamentName) {
        if (!this.isInited()) {
            await this.importTournamentDataFromAWS(tournamentName)
        }
    }

    importTournamentDataFromAWS(tournamentName) {
        return fetch(EndpointStore.buildUrl(false, "IMPORT_TOURNAMENT_DATA", {
            tournamentName: tournamentName
        }), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            this.tournamentData = response

            return response
        }).catch((error) => {
            console.log("Import Tournament Info Error", error)
        })
    }

    async getTournamentInfo(tournamentName) {
        await this.init(tournamentName)

        return this.tournamentData && this.tournamentData.tournamentInfo
    }

    async getTournamentKey(tournamentName) {
        await this.init(tournamentName)

        return this.tournamentData && this.tournamentData.tournamentKey
    }

    getPoolItem(poolKey) {
        if (this.tournamentData !== undefined) {
            return this.tournamentData.poolMap[poolKey]
        }
    }

    getResultItem(resultsKey) {
        if (this.tournamentData !== undefined) {
            return this.tournamentData.resultsMap[resultsKey.judgeName][resultsKey.time]
        }
    }
}

module.exports = new DataManager()
