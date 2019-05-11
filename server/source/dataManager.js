
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

    setPoolItem(pool) {
        if (this.tournamentData !== undefined) {
            this.tournamentData.poolMap[pool.key] = pool
        }
    }

    getResultItem(resultsKey) {
        if (this.tournamentData !== undefined) {
            return this.tournamentData.resultsMap[resultsKey.judgeName][resultsKey.time.toString()]
        }
    }

    async updateActivePoolAttribute(tournamentName, attributeName, attributeValue) {
        await this.init(tournamentName)

        if (this.tournamentData !== undefined) {
            let pool = this.tournamentData.poolMap[this.tournamentData.tournamentKey.playingPoolKey]
            if (pool !== undefined) {
                pool[attributeName] = attributeValue
            }
        }
    }

    setResults(judgeName, time, results) {
        if (this.tournamentData !== undefined) {
            this.tournamentData.resultsMap[judgeName] = this.tournamentData.resultsMap[judgeName] || {}
            this.tournamentData.resultsMap[judgeName][time.toString()] = {
                data: results,
                judgeName: judgeName,
                time: time
            }
        }
    }

    async updateTournamentKeyWithObject(tournamentName, newObject) {
        await this.init(tournamentName)

        if (this.tournamentData !== undefined) {
            let tournamentKey = await this.getTournamentKey(tournamentName)
            if (tournamentKey !== undefined) {
                for (let key in newObject) {
                    let safeKey = key.replace(/-/g, '_')
                    tournamentKey[safeKey] = newObject[safeKey]
                }
            }
        }
    }

    async updateTournamentKeyPlayingPool(tournamentName, playingPoolKey) {
        await this.init(tournamentName)

        if (this.tournamentData !== undefined) {
            let tournamentKey = await this.getTournamentKey(tournamentName)
            if (tournamentKey !== undefined) {
                tournamentKey.playingPoolKey = playingPoolKey
            }
        }
    }
}

module.exports = new DataManager()
