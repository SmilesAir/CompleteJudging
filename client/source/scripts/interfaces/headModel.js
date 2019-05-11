
const uuid4 = require("uuid/v4")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataStore = require("scripts/stores/dataStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const CommonAction = require("scripts/actions/commonAction.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Head Judge"
        this.type = Enums.EInterface.head

        this.playingPoolKey = undefined
        this.playPoolHash = undefined
        this.observableHash = undefined

        this.obs.startTime = undefined
        this.obs.isJudging = false
        this.obs.judgingTimeMs = 0
        this.obs.passiveMode = false

        this.obs.autoUpdateScoreboard = false
        this.obs.autoUpdateTimeRemaining = 0
        this.autoUpdateScoreboardHandle = undefined
        this.autoUpdateTimeRemainingHandle = undefined

        this.awsData = undefined
        this.obs.poolState = {}
    }

    init() {
        super.init()

        if (MainStore.startupTournamentName !== undefined) {
            this.queryPoolData(MainStore.startupTournamentName)
            setInterval(() => {
                this.update()
            }, 1000)
        }
    }

    getPoolDataForAWS() {
        return {
            poolHash: uuid4(),
            pool: this.obs.playingPool,
            observableHash: uuid4(),
            observable: {
                routineLengthSeconds: this.obs.playingPool.routineLengthSeconds,
                playingTeamIndex: this.obs.playingTeamIndex,
                startTime: this.obs.startTime
            }
        }
    }

    setPlayingPool(pool) {
        if (this.obs.playingPool !== pool) {
            this.obs.playingPool = pool
            this.obs.playingTeamIndex = pool.teamList.length > 0 ? 0 : undefined

            this.awsData = this.getPoolDataForAWS()
        }

        this.sendDataToAWS()
    }

    setPlayingTeam(teamData) {
        let index = this.obs.playingPool.teamList.indexOf(teamData)
        if (index !== -1) {
            this.setPlayingTeamIndex(index)
        }
    }

    setPlayingTeamIndex(index) {
        if (this.obs.playingTeamIndex !== index) {
            this.obs.playingTeamIndex = index
            this.awsData.observable.playingTeamIndex = index
            this.dirtyObs()

            this.sendDataToAWS()
        }
    }

    moveToNextTeam() {
        let isLastTeam = this.obs.playingTeamIndex >= this.obs.playingPool.teamList.length - 1
        this.setPlayingTeamIndex(isLastTeam ? undefined : this.obs.playingTeamIndex + 1)
    }

    dirtyObs() {
        this.awsData.observableHash = uuid4()
        this.awsData.observable.startTime = this.obs.startTime
    }

    updateFromAws(awsData) {
        if (this.obs.passiveMode) {
            this.obs.playingPool = new DataStore.PoolData(awsData.pool)
            this.obs.playingTeamIndex = awsData.observable.playingTeamIndex
            this.obs.routineLengthSeconds = awsData.observable.routineLengthSeconds

            if (this.obs.startTime !== awsData.observable.startTime) {
                this.obs.startTime = awsData.observable.startTime

                this.uploadIncrementalScoreboardData()
            }

            this.awsData = awsData
        } else if (DataAction.isSamePool(this.obs.playingPool, awsData.pool) === false) {
            location.reload(false)
        } else if (this.obs.playingPool === undefined) {
            this.obs.playingPool = new DataStore.PoolData(awsData.pool)
            this.obs.playingTeamIndex = awsData.observable.playingTeamIndex
            this.obs.routineLengthSeconds = awsData.observable.routineLengthSeconds

            this.awsData = awsData
        }

        this.obs.poolState = awsData.state

        return {
            userIdDirty: false
        }
    }

    updateResultsFromAws() {
        // Do Nothing
    }

    sendDataToAWS() {
        CommonAction.fetchEx("SET_PLAYING_POOL", {
            tournamentName: MainStore.tournamentName
        }, undefined, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: this.awsData
            })
        }).then((response) => {
            return response.json()
        }).then((response) => {
            if (response.status < 400) {
                this.playingPoolKey = response.playingPoolKey
            }
        }).catch((error) => {
            console.log("Error: Set Playing Pool", error)
        })
    }

    update() {
        this.queryPoolData(MainStore.tournamentName)

        this.obs.judgingTimeMs = this.obs.startTime !== undefined ? Date.now() - this.obs.startTime : 0
    }

    hasRoutineTimeElapsed() {
        return this.obs.judgingTimeMs / 1000 > this.obs.routineLengthSeconds
    }

    isDuringRoutineTime() {
        return this.obs.isJudging && !this.hasRoutineTimeElapsed()
    }

    onStartClick() {
        if (!this.obs.isJudging) {
            this.obs.isJudging = true

            this.obs.startTime = Date.now()
            this.dirtyObs()
            this.sendDataToAWS()

            this.uploadIncrementalScoreboardData()

            this.updateHandle = setInterval(() => {
                this.update()
            }, 100)
        } else if (this.hasRoutineTimeElapsed()) {
            this.onStopClick(true)

            this.moveToNextTeam()
        }
    }

    onStopClick(skipAwsUpdate) {
        this.obs.isJudging = false
        
        clearInterval(this.updateHandle)

        this.obs.judgingTimeMs = 0
        this.obs.startTime = undefined

        if (!skipAwsUpdate) {
            this.dirtyObs()
            this.sendDataToAWS()
        }
    }

    setPassiveMode(enabled) {
        this.obs.passiveMode = enabled
    }

    createResultsData() {
        // unused
    }

    uploadIncrementalScoreboardData() {
        DataAction.fillPoolResults(this.obs.playingPool).then(() => {
            let data = DataAction.getScoreboardResultsProcessed(this.obs.playingPool, this.obs.routineLengthSeconds, true)

            CommonAction.fetchEx("SET_SCOREBOARD_DATA", {
                tournamentName: MainStore.tournamentName
            }, undefined, {
                method: "POST",
                body: JSON.stringify({
                    scoreboardData: {
                        title: DataAction.getFullPoolDescription(this.obs.playingPool),
                        data: data,
                        incremental: true,
                        startTime: this.obs.startTime,
                        routineLengthSeconds: this.obs.routineLengthSeconds
                    }
                })
            }).catch((error) => {
                console.error(`Can't update scoreboard data. ${error}`)
            })
        })
    }

    finalizeScoreboardData() {
        this.setEnabledAutoUpdateScoreboard(false)

        DataAction.fillPoolResults(this.obs.playingPool).then(() => {
            let data = DataAction.getScoreboardResultsProcessed(this.obs.playingPool, this.obs.routineLengthSeconds)

            CommonAction.fetchEx("SET_SCOREBOARD_DATA", {
                tournamentName: MainStore.tournamentName
            }, undefined, {
                method: "POST",
                body: JSON.stringify({
                    scoreboardData: {
                        title: DataAction.getFullPoolDescription(this.obs.playingPool),
                        data: data,
                        startTime: this.obs.startTime,
                        routineLengthSeconds: this.obs.routineLengthSeconds
                    }
                })
            }).catch((error) => {
                console.error(`Can't update scoreboard data. ${error}`)
            })
        })
    }

    toggleAutoUpdateScoreboard() {
        this.setEnabledAutoUpdateScoreboard(!this.obs.autoUpdateScoreboard)
    }

    setEnabledAutoUpdateScoreboard(enabled) {
        this.obs.autoUpdateScoreboard = enabled

        if (enabled) {
            const updateIntervalMs = 9 * 1000
            this.obs.autoUpdateTimeRemaining = updateIntervalMs
            this.autoUpdateScoreboardHandle = setInterval(() => {
                this.obs.autoUpdateTimeRemaining = updateIntervalMs
                this.uploadIncrementalScoreboardData()
            }, updateIntervalMs)

            this.autoUpdateTimeRemainingHandle = setInterval(() => {
                this.obs.autoUpdateTimeRemaining -= 100
            }, 100)
        } else {
            clearInterval(this.autoUpdateScoreboardHandle)
            clearInterval(this.autoUpdateTimeRemainingHandle)
        }
    }
}
