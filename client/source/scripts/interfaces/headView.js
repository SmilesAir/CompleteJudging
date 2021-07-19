const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")
const Enums = require("scripts/stores/enumStore.js")
const ResultsView = require("scripts/views/resultsView.js")
const MainStore = require("scripts/stores/mainStore.js")
const LocStore = require("scripts/stores/locStore.js")

require("./headView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.interface = Interfaces.head
        this.obs = this.interface.obs
    }

    getTimeElement() {
        let judgingTimeDate = new Date(this.obs.judgingTimeMs)
        let judgingTime = `${judgingTimeDate.getMinutes()}:${("0" + judgingTimeDate.getSeconds()).slice(-2)}`
        let remainingTime = DataAction.getTimeString(Math.max(0, this.obs.routineLengthSeconds * 1000 - this.obs.judgingTimeMs))

        return (
            <div>
                {LocStore.TimeJudging}: {judgingTime}
                {"   /   "}
                {LocStore.RemainingTime}: {remainingTime}
            </div>
        )
    }

    getPlayingTeamElement() {
        let teamName = "No Playing Team Set"
        let teamIndex = this.obs.playingTeamIndex
        let teamList = this.interface.calcTeamList()

        if (teamIndex !== undefined && teamIndex < teamList.length) {
            teamName = teamList[teamIndex].getPlayerNamesString()
        }

        return <div>{LocStore.PlayingTeam}: {teamName}</div>
    }

    onTeamClick(teamData) {
        if (!this.obs.isJudging) {
            Interfaces.head.setPlayingTeam(teamData)
        }
    }

    getTeamsElement() {
        let teamIndex = -1
        let teamList = this.interface.calcTeamList()
        let teamListElements = teamList.map((teamData) => {
            ++teamIndex
            let playingIndex = this.interface.getAdjustPlayingIndex()
            let className = `teamContainer ${playingIndex === teamIndex ? "playing" : ""} ${this.obs.isJudging ? "normalCursor" : ""}`
            return <div key={teamIndex} className={className}
                onClick={() => this.onTeamClick(teamData)}>{teamData.getPlayerNamesString()}</div>
        })

        return (
            <div className="teamListContainer">
                {LocStore.Teams}:
                {teamListElements}
            </div>
        )
    }

    onStartButtonClick() {
        Interfaces.head.onStartClick()
    }

    onStopButtonClick() {
        Interfaces.head.onStopClick()
    }

    getStartButtonText() {
        if (this.obs.playingTeamIndex === undefined) {
            return LocStore.SetPlayingTeam
        } else if (this.obs.isJudging) {
            if (Interfaces.head.hasRoutineTimeElapsed()) {
                return LocStore.HeadJudgingFinished
            } else {
                return LocStore.HeadJudgingActive
            }
        } else {
            return LocStore.HeadClickFirstThrow
        }
    }

    onPassiveButtonClick() {
        this.interface.setPassiveMode(!this.obs.passiveMode)
    }

    getJudgeStatusString(status) {
        switch (status) {
        case Enums.EStatus.none:
            return LocStore.Unknown
        case Enums.EStatus.ready:
            return LocStore.Ready
        case Enums.EStatus.finished:
            return LocStore.Finished
        case Enums.EStatus.opened:
            return LocStore.Opened
        }

        return LocStore.Unknown
    }

    getJudgeStatus(judge) {
        let judgeState = this.obs.poolState[0] && this.obs.poolState[0][judge.FullName] ||
        this.obs.poolState[1] && this.obs.poolState[1][judge.FullName]

        return this.getJudgeStatusString(judgeState && judgeState.status || Enums.EStatus.none)
    }

    getJudgeStatusElement(categoryName, judge) {
        let statusString = this.getJudgeStatus(judge)
        return (
            <div key={judge.FullName}>
                {categoryName}: {judge.FullName} {statusString}
            </div>
        )
    }

    parseJudgeElements(judgeData) {
        let exElements = judgeData.judgesEx.map((judge) => {
            return this.getJudgeStatusElement(LocStore.ExAi, judge)
        })
        let aiElements = judgeData.judgesAi.map((judge) => {
            return this.getJudgeStatusElement(LocStore.Variety, judge)
        })
        let diffElements = judgeData.judgesDiff.map((judge) => {
            return this.getJudgeStatusElement(LocStore.Diff, judge)
        })

        return {
            ex: exElements,
            ai: aiElements,
            diff: diffElements
        }
    }

    getJudgesElement() {
        let judgeData = this.interface.getPool(false).judgeData
        if (judgeData !== undefined) {
            let parsedData = this.parseJudgeElements(judgeData)

            let poolAlt = this.interface.getPool(true)
            let judgeDataAlt = poolAlt && poolAlt.judgeData
            let parsedDataAlt = judgeDataAlt && this.parseJudgeElements(judgeDataAlt)

            return (
                <div>
                    Judges:
                    {parsedData.ex}
                    {parsedData.ai}
                    {parsedData.diff}
                    {parsedDataAlt !== undefined ? LocStore.AltPoolJudges + ":" : ""}
                    {parsedDataAlt !== undefined ? parsedDataAlt.ex : null}
                    {parsedDataAlt !== undefined ? parsedDataAlt.ai : null}
                    {parsedDataAlt !== undefined ? parsedDataAlt.diff : null}
                </div>
            )
        }

        return null
    }

    getResultsElement(pool) {
        if (pool === undefined || pool.results === undefined || !MainStore.lanMode) {
            return null
        }

        return <ResultsView
            resultsData={DataAction.getFullResultsProcessed(pool, this.obs.routineLengthSeconds)}
            poolDesc={DataAction.getFullPoolDescription(pool)}/>
    }

    render() {
        let pool = this.interface.getPool(false)
        if (pool === undefined) {
            return <div className="headTopContainer">{LocStore.SetPlayingPoolReq}</div>
        }

        let altPool = this.interface.getPool(true)
        let altPoolName = altPool !== undefined ? ` / ${DataAction.getFullPoolDescription(altPool)}` : ""

        return (
            <div className="headTopContainer">
                <div className="header">
                    <div>
                        {LocStore.HeadJudge}
                    </div>
                    <button className="passiveButton" onClick={() => this.onPassiveButtonClick()}>{this.obs.passiveMode ? LocStore.DisablePassiveMode : LocStore.EnablePassiveMode}</button>
                    <button className="uploadScoreboardButton" onClick={() => this.interface.toggleScoreboardIncremental()}>{LocStore.ToggleScoreboardFinalized}</button>
                </div>
                <div className="poolDetailsContainer">{DataAction.getFullPoolDescription(pool)}{altPoolName}</div>
                {this.getTimeElement()}
                {this.getPlayingTeamElement()}
                <button disabled={Interfaces.head.isDuringRoutineTime() || this.obs.playingTeamIndex === undefined} className="startButton" onClick={() => this.onStartButtonClick()}>
                    {this.getStartButtonText()}
                </button>
                <button disabled={!this.obs.isJudging} className="startButton" onClick={() => this.onStopButtonClick()}>
                    {LocStore.Stop}
                </button>
                <div className="poolInfoContainer">
                    {this.getTeamsElement()}
                    {this.getJudgesElement()}
                </div>
                {this.getResultsElement(pool)}
            </div>
        )
    }
}
