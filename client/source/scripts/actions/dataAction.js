
const DataStore = require("scripts/stores/dataStore.js")
const MainStore = require("scripts/stores/mainStore.js")

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
                                console.log(`Error: Can't find Id for player: ${player}`)
                            }
                        }

                        teamList.push(newTeam)
                    }

                    if (teamList.length > 0) {
                        let newPool = {
                            divisionIndex: division.division,
                            roundIndex: round.round,
                            poolIndex: pool.pool,
                            teamList: teamList
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
