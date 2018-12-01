
const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const DataStore = require("scripts/stores/dataStore.js")

module.exports = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Diff Judge"
        this.type = Enums.EInterface.diff

        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs = Mobx.observable({
            playingPool: undefined,
            routineLengthSeconds: undefined,
            playingTeamIndex: undefined,
            results: undefined,
            dragTeamIndex: undefined,
            editIndex: undefined
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

            this.obs.results = new ResultsDataDiff(this.obs.playingPool)
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

    addScore(score) {
        this.obs.results.addScore(this.obs.playingTeamIndex, score)

        this.reportScores()
    }

    startEdit(markIndex) {
        this.obs.editIndex = markIndex
    }

    endEdit(score) {
        if (score !== undefined && this.obs.editIndex !== undefined) {
            this.obs.results.teamScoreList[this.obs.playingTeamIndex].scores[this.obs.editIndex] = score

            this.reportScores()
        }

        this.obs.editIndex = undefined
    }
}

class TeamDiffScores {
    constructor() {
        this.scores = Mobx.observable([])
    }

    addScore(score) {
        this.scores.push(score)
    }
}

class ResultsDataDiff extends DataStore.ResultsDataBase {
    constructor(poolData) {
        super(poolData.divisionIndex, poolData.roundIndex, poolData.poolIndex, poolData.teamList)

        this.teamScoreList = []
        for (let i = 0; i < this.teamList.length; ++i) {
            this.teamScoreList.push(new TeamDiffScores())
        }

        this.teamScoreList = Mobx.observable(this.teamScoreList)
    }

    addScore(teamIndex, score) {
        this.teamScoreList[teamIndex].addScore(score)
    }
}
