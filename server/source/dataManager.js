
const fetch = require("node-fetch")
const fs = require("file-system")

const EndpointStore = require("complete-judging-common/source/endpoints.js")


class DataManager {
    constructor() {
        this.tournamentData = undefined

        this.dataDirty = false

        this.loadLatestTournamentDataFromDisk()
    }

    isInited() {
        return this.tournamentData !== undefined
    }

    async init(tournamentName) {
        if (!this.isInited()) {
            await this.importTournamentDataFromAWS(tournamentName)

            this.saveTournamentDataToDisk()

            setInterval(() => {
                if (this.dataDirty) {
                    this.saveTournamentDataToDisk()
                }
            }, 60 * 1000)
        }
    }

    onDataChanged() {
        this.dataDirty = true
    }

    saveTournamentDataToDisk() {
        let now = new Date()
        let filename = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`
        let folderName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}`
        fs.writeFile(`serverData/${folderName}/${filename}`, JSON.stringify(this.tournamentData))

        fs.writeFile("serverData/data.json", JSON.stringify({
            latest: `${folderName}/${filename}`
        }))

        this.dataDirty = false
    }

    loadLatestTournamentDataFromDisk() {
        try {
            let data = JSON.parse(fs.readFileSync("serverData/data.json"))
            this.tournamentData = JSON.parse(fs.readFileSync(`serverData/${data.latest}`))

            console.log(`Loaded ${data.latest} for ${this.tournamentData.tournamentKey.tournamentName}`)
        }
        catch(error) {
            console.error("Error loading tournament data:", error)
        }
    }

    importTournamentDataFromAWS(tournamentName) {
        console.log(`-------- Importing ${tournamentName} -----------`)

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

            this.onDataChanged()

            return response
        }).catch((error) => {
            console.log("Import Tournament Data Error", error)
        })
    }

    exportTournamentDataToAWS(tournamentName) {
        return fetch(EndpointStore.buildUrl(false, "EXPORT_TOURNAMENT_DATA", {
            tournamentName: tournamentName
        }), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.tournamentData)
        }).catch((error) => {
            console.log("Export Tournament Data Error", error)
        })
    }

    getPlayingPool() {
        return this.tournamentData && this.tournamentData.poolMap[this.tournamentData.tournamentKey.playingPoolKey]
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

            this.onDataChanged()
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
            let pool = this.getPlayingPool()
            if (pool !== undefined) {
                pool[attributeName] = attributeValue

                this.onDataChanged()
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

            this.onDataChanged()
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

                    this.onDataChanged()
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

                this.onDataChanged()
            }
        }
    }

    async setJudgeState(tournamentName, judgeId, status) {
        await this.init(tournamentName)

        if (this.tournamentData !== undefined) {
            let pool = this.getPlayingPool()
            if (pool !== undefined) {
                pool.data.state = pool.data.state || {}
                pool.data.state[judgeId] = {
                    status: status
                }

                this.onDataChanged()
            }
        }
    }
}

module.exports = new DataManager()
