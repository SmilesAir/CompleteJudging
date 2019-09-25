
const DataStore = require("scripts/stores/dataStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataModel = require("scripts/models/dataModel.js")
const CommonAction = require("scripts/actions/commonAction.js")

function init() {
    DataStore.dataModel = new DataModel()
}
module.exports.init = init

function getPlayerId(playerList, player) {
    if (player.id !== undefined) {
        return player.id
    } else {
        let foundPlayer = playerList.find((listPlayer) => {
            return listPlayer.firstName === player.firstName && listPlayer.lastName === player.lastName
        })

        if (foundPlayer !== undefined) {
            return foundPlayer.id
        } else {
            return undefined
        }
    }
}
module.exports.getPlayerId = getPlayerId

function loadDataFromPoolCreator(info) {
    if (info === undefined) {
        return undefined
    }

    if (info.isPoolCreatorData) {
        let data = info.data

        let nextPlayerId = 1
        let playerList = []
        for (let player of data.registeredPlayers) {
            let newPlayer = new DataStore.PlayerData(player)
            newPlayer.id = nextPlayerId++
            playerList.push(newPlayer)
        }

        let poolList = []
        for (let division of data.divisions) {
            for (let round of division.rounds) {
                for (let pool of round.pools) {
                    let teamList = []

                    for(let team of pool.teamList.teams) {
                        let newTeam = new DataStore.TeamData()

                        for (let player of team.players) {
                            let id = getPlayerId(playerList, player)
                            if (id !== undefined) {
                                newTeam.playerList.push(id)
                            } else {
                                console.log(`Error: Can't find Id for player: ${player.FullName}`)
                            }
                        }

                        teamList.push(newTeam)
                    }

                    if (teamList.length > 0) {
                        let newPool = {
                            divisionIndex: division.division,
                            roundIndex: round.round,
                            poolIndex: pool.pool,
                            teamList: teamList,
                            routineLengthSeconds: round.routineLength * 60,
                            judgeData: pool.judgesData
                        }

                        poolList.push(newPool)
                    }
                }
            }
        }

        return {
            playerList: playerList,
            poolList: poolList
        }
    }

    return info.data
}
module.exports.loadDataFromPoolCreator = loadDataFromPoolCreator

function getFullPlayerName(id) {
    let player = getPlayerData(id)
    return player !== undefined ? `${player.firstName} ${player.lastName}` : undefined
}
module.exports.getFullPlayerName = getFullPlayerName

function getFullPlayerNameRankAndCountry(id) {
    let player = getPlayerData(id)
    return player !== undefined ? `${player.firstName} ${player.lastName} (#${player.rank}) ${player.country}` : undefined
}
module.exports.getFullPlayerNameRankAndCountry = getFullPlayerNameRankAndCountry

function getFullPlayerNameShort(id) {
    let player = getPlayerData(id)
    return player !== undefined ? `${player.firstName} ${player.lastNameShort}.` : undefined
}
module.exports.getFullPlayerNameShort = getFullPlayerNameShort

function getTeamPlayers(team, divider = " - ") {
    if (team !== undefined) {
        return team.playerList.map((playerId) => {
            return getFullPlayerName(playerId)
        }).join(divider)
    }

    return ""
}
module.exports.getTeamPlayers = getTeamPlayers

function getTeamPlayersRankAndCountry(team, divider = " - ") {
    if (team !== undefined) {
        return team.playerList.map((playerId) => {
            return getFullPlayerNameRankAndCountry(playerId)
        }).join(divider)
    }

    return ""
}
module.exports.getTeamPlayersRankAndCountry = getTeamPlayersRankAndCountry

function getTeamPlayersShort(team, divider = " - ") {
    return team.playerList.map((playerId) => {
        return getFullPlayerNameShort(playerId)
    }).join(divider)
}
module.exports.getTeamPlayersShort = getTeamPlayersShort

function getPlayerData(id) {
    if (MainStore.saveData !== undefined) {
        return MainStore.saveData.playerList.find((player) => {
            return player.id === id
        })
    }

    return undefined
}
module.exports.getPlayerData = getPlayerData

function getDivisionNameFromIndex(index) {
    switch(index) {
    case 0:
        return "Open Pairs"
    case 1:
        return "Mixed Pairs"
    case 2:
        return "Coop"
    case 3:
        return "Women Pairs"
    }

    return undefined
}
module.exports.getDivisionNameFromIndex = getDivisionNameFromIndex

function getRoundNameFromIndex(index) {
    switch(index) {
    case 0:
        return "Finals"
    case 1:
        return "Semifinals"
    case 2:
        return "Quaterfinals"
    case 3:
        return "Preliminaries"
    }

    return undefined
}
module.exports.getRoundNameFromIndex = getRoundNameFromIndex

function getPoolNameFromIndex(index) {
    switch(index) {
    case 0:
        return "A"
    case 1:
        return "B"
    case 2:
        return "C"
    case 3:
        return "D"
    }

    return undefined
}
module.exports.getPoolNameFromIndex = getPoolNameFromIndex

function getFullPoolDescription(pool) {
    let poolName = pool.roundIndex !== 0 ? ` ${getPoolNameFromIndex(pool.poolIndex)}` : ""
    return `${getDivisionNameFromIndex(pool.divisionIndex)} ${getRoundNameFromIndex(pool.roundIndex)}${poolName}`
}
module.exports.getFullPoolDescription = getFullPoolDescription

function getResultsSummary(results) {
    return DataStore.dataModel.getResultsSummary(results)
}
module.exports.getResultsSummary = getResultsSummary

function createTeamDataArray() {
    return []
}

function createTeamDataObject() {
    return {}
}

function getResultsProcessed(pool, routineLengthSeconds, processFunc, createTeamDataFunc) {
    let processedRet = []
    let preProcess = {}

    for (let judgeData of pool.results) {
        for (let teamIndex = 0; teamIndex < judgeData.data.teamScoreList.length; ++teamIndex) {
            let teamData = judgeData.data.teamList[teamIndex]
            let teamNames = getTeamPlayersShort(teamData)
            preProcess[teamNames] = preProcess[teamNames] || {
                routineLengthSeconds: routineLengthSeconds
            }

            DataStore.dataModel.preProcessedData(judgeData.data, teamIndex, preProcess[teamNames])
        }
    }

    if (pool.results.length > 0) {
        for (let judgeData of pool.results) {
            for (let teamIndex = 0; teamIndex < judgeData.data.teamScoreList.length; ++teamIndex) {
                let teamData = judgeData.data.teamList[teamIndex]
                let teamNames = getTeamPlayersShort(teamData)
                let processedData = processedRet.find((team) => {
                    return team.teamNames === teamNames
                })
                if (processedData === undefined) {
                    processedData = {
                        teamNames: teamNames,
                        data: createTeamDataFunc()
                    }
                    processedRet.push(processedData)
                }

                let processed = processFunc.bind(DataStore.dataModel)(judgeData.data, teamIndex, preProcess[teamNames], processedData.data)
                if (processed !== undefined) {
                    processedData.data.push({
                        judgeName: judgeData.judgeName,
                        processed: processed
                    })
                }
            }
        }
    } else {
        for (let playerList of pool.teamList) {
            let teamNames = getTeamPlayersShort(playerList)
            processedRet.push({
                teamNames: teamNames,
                data: createTeamDataFunc()
            })
        }
    }

    let hasProcessedData = false
    for (let teamData of processedRet) {
        let teamDataList = teamData.data
        let totalScore = 0

        if (Array.isArray(teamDataList)) {
            for (let judgeData of teamDataList) {
                for (let scoreData of judgeData.processed) {
                    totalScore += scoreData.Score || 0
                    totalScore -= (scoreData.Adj || 0) + (scoreData.Adjusted || 0)

                    hasProcessedData = true
                }
            }
        }

        if (hasProcessedData) {
            teamDataList.push({
                TotalScore: totalScore
            })
        }
    }

    if (!hasProcessedData) {
        for (let data of processedRet) {
            let teamData = data.data
            let totalScore = 0

            for (let key in teamData) {
                // if (key === "diff" ||
                //     key === "variety" ||
                //     key === "ai") {

                //     totalScore += teamData[key]
                // } else if (key === "ex") {
                //     totalScore -= teamData[key]
                // }

                totalScore += teamData[key]
            }

            teamData.totalScore = totalScore
        }
    } else {
        for (let teamData of processedRet) {
            let totalScore = teamData.data.find((data) => {
                return data.TotalScore !== undefined
            }).TotalScore

            let rank = 1
            if (totalScore !== undefined) {
                for (let searchData of processedRet) {
                    if (searchData !== teamData) {
                        let searchScore = searchData.data.find((data) => {
                            return data.TotalScore !== undefined
                        }).TotalScore

                        if (searchScore !== undefined) {
                            if (searchScore >= totalScore) {
                                ++rank
                            }
                        }
                    }
                }
            }

            teamData.data.push({
                Rank: rank
            })
        }
    }

    for (let teamData of processedRet) {
        let teamDataList = teamData.data
        if (Array.isArray(teamDataList)) {
            teamDataList.sort((a, b) => {
                if (a.judgeName !== undefined && b.judgeName === undefined) {
                    return -1
                } else if (a.judgeName === undefined && b.judgeName !== undefined) {
                    return 1
                } else if (a.judgeName === undefined && b.judgeName === undefined) {
                    return 0
                }

                if (a.judgeName.toLowerCase() < b.judgeName.toLowerCase()) {
                    return -1
                } else if (a.judgeName.toLowerCase() > b.judgeName.toLowerCase()) {
                    return 1
                } else {
                    return 0
                }
            })
        }
    }

    return processedRet
}

function getFullResultsProcessed(pool, routineLengthSeconds) {
    return getResultsProcessed(pool, routineLengthSeconds, DataStore.dataModel.getFullResultsProcessed, createTeamDataArray)
}
module.exports.getFullResultsProcessed = getFullResultsProcessed

function getScoreboardResultsProcessed(pool, routineLengthSeconds, incremental) {
    let processed = getResultsProcessed(
        pool,
        routineLengthSeconds,
        incremental ?
            DataStore.dataModel.getIncrementalScoreboardResultsProcessed :
            DataStore.dataModel.getScoreboardResultsProcessed,
        createTeamDataObject)

    processed.sort((a, b) => {
        if (a.data.totalScore === b.data.totalScore) {
            return 0
        } else if (a.data.totalScore === 0) {
            return 1
        } else if (b.data.totalScore === 0) {
            return -1
        }

        return a.data.totalScore > b.data.totalScore ? -1 : 1
    })

    let rank = 1
    let queueIndex = 0
    for (let teamData of processed) {
        if (teamData.data.totalScore !== 0) {
            teamData.data.rank = rank++
        } else {
            teamData.data.rank = queueIndex === 0 ? "^^^" : `${Math.round(queueIndex * (routineLengthSeconds / 60 + 2))}m`
            ++queueIndex
        }
    }

    return processed
}
module.exports.getScoreboardResultsProcessed = getScoreboardResultsProcessed

function getCategoryResultsProcessed(pool, routineLengthSeconds) {
    let processed = getResultsProcessed(
        pool,
        routineLengthSeconds,
        DataStore.dataModel.getCategoryResultsProcessed,
        createTeamDataObject)

    for (let teamData of processed) {
        let rank = 1
        let score = teamData.data.totalScore
        for (let searchData of processed) {
            if (searchData !== teamData) {
                if (score <= searchData.data.totalScore) {
                    ++rank
                }
            }
        }

        teamData.data.rank = rank
    }

    return processed
}
module.exports.getCategoryResultsProcessed = getCategoryResultsProcessed

function getDiffDetailedResultsProcessed(pool, routineLengthSeconds) {
    return getResultsProcessed(pool, routineLengthSeconds, DataStore.dataModel.getDiffDetailedResultsProcessed, createTeamDataArray)
}
module.exports.getDiffDetailedResultsProcessed = getDiffDetailedResultsProcessed

function getExAiCombinedDetailedResultsProcessed(pool, routineLengthSeconds) {
    return getResultsProcessed(pool, routineLengthSeconds, DataStore.dataModel.getExAiCombinedDetailedResultsProcessed, createTeamDataArray)
}
module.exports.getExAiCombinedDetailedResultsProcessed = getExAiCombinedDetailedResultsProcessed

function getHudProcessed(pool, routineLengthSeconds) {
    let processed = getResultsProcessed(
        pool,
        routineLengthSeconds,
        DataStore.dataModel.getHudProcessed,
        createTeamDataObject)

    for (let teamData of processed) {
        let rank = 1
        let score = teamData.data.totalScore
        for (let searchData of processed) {
            if (searchData !== teamData) {
                if (score <= searchData.data.totalScore) {
                    ++rank
                }
            }
        }

        teamData.data.rank = rank
    }

    return processed
}
module.exports.getHudProcessed = getHudProcessed

function getResultsInspected(results, teamIndex) {
    return DataStore.dataModel.getResultsInspected(results, teamIndex)
}
module.exports.getResultsInspected = getResultsInspected

function isTeamEqual(a, b) {
    if (a.playerList.length !== b.playerList.length) {
        return false
    }

    for (let i = 0; i < a.playerList.length; ++i) {
        if (a.playerList[i] !== b.playerList[i]) {
            return false
        }
    }

    return true
}
module.exports.isTeamEqual = isTeamEqual

function isTeamListEqual(a, b) {
    if (a.length !== b.length) {
        return false
    }

    for (let teamIndex = 0; teamIndex < a.length; ++teamIndex) {
        if (!isTeamEqual(a[teamIndex], b[teamIndex])) {
            return false
        }
    }

    return true
}
module.exports.isTeamListEqual = isTeamListEqual

function isSamePool(a, b) {
    if (a === b) {
        return true
    }

    if (a === undefined || b === undefined) {
        return undefined
    }

    if (a.divisionIndex === b.divisionIndex &&
        a.roundIndex === b.roundIndex &&
        a.poolIndex === b.poolIndex) {
        
        return true
    }

    return false
}
module.exports.isSamePool = isSamePool

function verifyDataModel(model) {
    if (model.DataClass === undefined ||
        model.verify === undefined ||
        model.getSummary === undefined ||
        model.getDefaultConstants === undefined) {
        
        return false
    }

    return true
}
module.exports.verifyDataModel = verifyDataModel

function verifyDataConstants(constants) {
    if (constants.name === undefined) {
        
        return false
    }

    return true
}
module.exports.verifyDataConstants = verifyDataConstants

function fillPoolResults(poolData) {
    return CommonAction.fetchEx("GET_POOL_RESULTS", {
        tournamentName: MainStore.tournamentName,
        divisionIndex: poolData.divisionIndex,
        roundIndex: poolData.roundIndex,
        poolIndex: poolData.poolIndex
    }, undefined, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        return response.json()
    }).then((response) => {
        poolData.results = response
    }).catch((error) => {
        console.log("Fill Pool Results Error", error)
    })
}
module.exports.fillPoolResults = fillPoolResults

function clearPoolResults(poolData) {
    return CommonAction.fetchEx("CLEAR_POOL_RESULTS", {
        tournamentName: MainStore.tournamentName,
        divisionIndex: poolData.divisionIndex,
        roundIndex: poolData.roundIndex,
        poolIndex: poolData.poolIndex
    }, undefined, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).catch((error) => {
        console.log("Clear Pool Results Error", error)
    })
}
module.exports.clearPoolResults = clearPoolResults

function getPoolResults(divisionIndex, roundIndex, poolIndex) {
    return CommonAction.fetchEx("GET_POOL_RESULTS", {
        tournamentName: MainStore.tournamentName,
        divisionIndex: divisionIndex,
        roundIndex: roundIndex,
        poolIndex: poolIndex
    }, undefined, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        return response.json()
    }).then((response) => {
        return response
    }).catch((error) => {
        console.log("Get Pool Results Error", error)
    })
}
module.exports.getPoolResults = getPoolResults

function getTimeString(timeMs) {
    let timeDate = new Date(timeMs)
    return `${timeDate.getMinutes()}:${("0" + timeDate.getSeconds()).slice(-2)}`
}
module.exports.getTimeString = getTimeString

function getResultsFilename(pool) {
    return `${getDivisionNameFromIndex(pool.divisionIndex)} ${getRoundNameFromIndex(pool.roundIndex)} ${getPoolNameFromIndex(pool.poolIndex)}`
}
module.exports.getResultsFilename = getResultsFilename
