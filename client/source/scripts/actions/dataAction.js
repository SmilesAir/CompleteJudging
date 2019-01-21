
const DataStore = require("scripts/stores/dataStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataModel = require("scripts/models/dataModel.js")

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

function loadDataFromDynamo(info) {
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
                            routineLengthSeconds: round.routineLength * 60
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
module.exports.loadDataFromDynamo = loadDataFromDynamo

function getFullPlayerName(id) {
    let player = getPlayerData(id)
    return player !== undefined ? `${player.firstName} ${player.lastName}` : undefined
}
module.exports.getFullPlayerName = getFullPlayerName

function getTeamPlayers(team, divider = " - ") {
    return team.playerList.map((playerId) => {
        return getFullPlayerName(playerId)
    }).join(divider)
}
module.exports.getTeamPlayers = getTeamPlayers

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
    return `${getDivisionNameFromIndex(pool.divisionIndex)} ${getRoundNameFromIndex(pool.roundIndex)} ${getPoolNameFromIndex(pool.poolIndex)}`
}
module.exports.getFullPoolDescription = getFullPoolDescription

function getResultsSummary(results) {
    return DataStore.dataModel.getResultsSummary(results)
}
module.exports.getResultsSummary = getResultsSummary

function getResultsProcessed(scoreData, teamIndex) {
    return DataStore.dataModel.getResultsProcessed(scoreData, teamIndex)
}
module.exports.getResultsProcessed = getResultsProcessed

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
    return fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPoolResults?tournamentName=${MainStore.tournamentName}&divisionIndex=${poolData.divisionIndex}&roundIndex=${poolData.roundIndex}&poolIndex=${poolData.poolIndex}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then((response) => {
        return response.json()
    }).then((response) => {
        poolData.results = response
    }).catch((error) => {
        console.log("Fill Pool Results Error", error)
    })
}
module.exports.fillPoolResults = fillPoolResults

function getPoolResults(divisionIndex, roundIndex, poolIndex) {
    return fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPoolResults?tournamentName=${MainStore.tournamentName}&divisionIndex=${divisionIndex}&roundIndex=${roundIndex}&poolIndex=${poolIndex}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then((response) => {
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
