
const DataAction = require("scripts/actions/dataAction.js")

module.exports.INVALID_PLAYER_ID = 0

module.exports.PlayerData = class {
    constructor(poolCreatorPlayer) {
        this.firstName = poolCreatorPlayer.firstName
        this.lastName = poolCreatorPlayer.lastName
        this.points = poolCreatorPlayer.points
        this.womenPoints = poolCreatorPlayer.womenPoints
        this.rank = poolCreatorPlayer.rank
    }
}

module.exports.TeamData = class {
    constructor(teamJson) {
        this.playerList = []

        if (teamJson !== undefined) {
            teamJson.playerList.forEach((player) => {
                this.playerList.push(player)
            })
        }
    }

    getPlayerNamesString() {
        return this.playerList.map((playerId) => {
            return DataAction.getFullPlayerName(playerId)
        }).join(" - ")
    }
}

module.exports.PoolData = class {
    constructor(poolJson) {
        this.teamList = []

        if (poolJson !== undefined) {
            poolJson.teamList.forEach((team) => {
                this.teamList.push(new module.exports.TeamData(team))
            })
        }
    }
}
