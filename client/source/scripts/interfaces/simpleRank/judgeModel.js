
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const DataStore = require("scripts/stores/dataStore.js")

module.exports = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Rank Judge"
        this.type = Enums.EInterface.rank

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            playingPool: undefined,
            routineLengthSeconds: undefined,
            playingTeamIndex: undefined,
            results: undefined,
            dragTeamIndex: undefined
        })
    }

    init() {
        if (MainStore.startupTournamentName !== undefined) {
            this.queryPoolData(MainStore.startupTournamentName)
        }

        setInterval(() => {
            this.queryPoolData(MainStore.tournamentName)
        }, this.updateIntervalMs)
    }

    queryPoolData(tournamentName) {
        fetch(`https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getPlayingPool?tournamentName=${tournamentName}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
            if (response.status < 400) {
                return response.json()
            } else {
                throw new Error(response.statusText)
            }
        }).then((response) => {
            this.updateFromAws(response)
        }).catch((error) => {
            console.log("Error: Set Playing Pool", error)
        })
    }

    updateFromAws(awsData) {
        if (this.playPoolHash !== awsData.poolHash) {
            this.playPoolHash = awsData.poolHash
            this.obs.playingPool = new DataStore.PoolData(awsData.pool)

            this.obs.results = new ResultsDataRank(this.obs.playingPool)
        }

        if (this.observableHash !== awsData.observableHash) {
            this.observableHash = awsData.observableHash
            this.obs.routineLengthSeconds = awsData.observable.routineLengthSeconds
            this.obs.playingTeamIndex = awsData.observable.playingTeamIndex
        }

        // // Test
        // for (let i = 0; i < 3; ++i) {
        //     this.obs.playingPool.teamList[i].played = true
        //     this.obs.playingTeamIndex = 3
        // }
    }

    startScoreDrag(teamIndex) {
        this.obs.dragTeamIndex = teamIndex
    }

    endScoreDrag() {
        this.obs.dragTeamIndex = undefined

        this.updateTeamListOrder()

        this.reportScores()
    }

    onScoreDrag(event) {
        if (this.obs.dragTeamIndex !== undefined) {
            this.obs.results.rawPointsList[this.obs.dragTeamIndex] += event.movementX / event.currentTarget.clientWidth * 100
        }
    }

    updateTeamListOrder() {
        let newTeamList = []
        let newPointsList = []
        let teamList = this.obs.playingPool.teamList
        let pointsList = this.obs.results.rawPointsList
        let playingTeam = teamList[this.obs.playingTeamIndex]
        for (let teamIndex = 0; teamIndex < teamList.length; ++teamIndex) {
            let team = teamList[teamIndex]
            let points = pointsList[teamIndex]
            if (teamIndex === this.obs.playingTeamIndex || team.played === true) {
                let inserted = false
                for (let sortedIndex = 0; sortedIndex < newPointsList.length; ++sortedIndex) {
                    let sortedPoints = newPointsList[sortedIndex]
                    if (points > sortedPoints) {
                        newTeamList.splice(sortedIndex, 0, team)
                        newPointsList.splice(sortedIndex, 0, points)

                        inserted = true
                        break
                    }
                }

                if (!inserted) {
                    newTeamList.push(team)
                    newPointsList.push(points)
                }
            } else {
                newTeamList.push(team)
                newPointsList.push(points)
            }
        }

        teamList.length = 0
        for (let newTeam of newTeamList) {
            teamList.push(newTeam)
        }
        pointsList.length = 0
        for (let points of newPointsList) {
            pointsList.push(points)
        }

        this.obs.playingTeamIndex = teamList.indexOf(playingTeam)
    }

    reportScores() {
        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/reportJudgeScore",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tournamentName: MainStore.tournamentName,
                    judgeId: MainStore.userId,
                    results: this.obs.results
                })
            }).catch((error) => {
            console.log("Report Scores Error:", error)
        })
    }
}

class ResultsDataRank extends DataStore.ResultsDataBase {
    constructor(poolData) {
        super(poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.rawPointsList = Mobx.observable([])
        for (let i = 0; i < this.teamList.length; ++i) {
            this.rawPointsList.push(0)
        }
    }
}
