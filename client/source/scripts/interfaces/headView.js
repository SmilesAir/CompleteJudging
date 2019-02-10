const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

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
                Time judging: {judgingTime}
                {"   /   "}
                Remaining Time: {remainingTime}
            </div>
        )
    }

    getPlayingTeamElement() {
        let teamName = "No Playing Team Set"
        let teamIndex = this.obs.playingTeamIndex
        if (teamIndex !== undefined && teamIndex < this.obs.playingPool.teamList.length) {
            teamName = this.obs.playingPool.teamList[teamIndex].getPlayerNamesString()
        }

        return <div>Playing Team: {teamName}</div>
    }

    onTeamClick(teamData) {
        Interfaces.head.setPlayingTeam(teamData)
    }

    getTeamsElement() {
        let teamIndex = -1
        let teamList = this.obs.playingPool.teamList.map((teamData) => {
            ++teamIndex
            return <div key={teamIndex} className={`teamContainer ${this.obs.playingTeamIndex === teamIndex ? "playing" : ""}`}
                onClick={() => this.onTeamClick(teamData)}>{teamData.getPlayerNamesString()}</div>
        })

        return (
            <div>
                Teams:
                {teamList}
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
            return "Set Playing Team"
        } else if (this.obs.isJudging) {
            if (Interfaces.head.hasRoutineTimeElapsed()) {
                return "Judging Finished. Select Next Team."
            } else {
                return "Judging Active"
            }
        } else {
            return "Click on First Throw"
        }
    }

    onPassiveButtonClick() {
        this.interface.setPassiveMode(!this.obs.passiveMode)
    }

    render() {
        if (this.obs.playingPool === undefined) {
            return <div className="headTopContainer">Set playing pool for Head Judge to function</div>
        }

        return (
            <div className="headTopContainer">
                <div className="header">
                    <div>
                        Head Judge
                    </div>
                    <button className="passiveButton" onClick={() => this.onPassiveButtonClick()}>{this.obs.passiveMode ? "Disable Passive Mode" : "Enable Passive Mode"}</button>
                    <button className="uploadScoreboardButton" onClick={() => this.interface.uploadScoreboardData()}>Update Scoreboard</button>
                </div>
                <div className="poolDetailsContainer">{DataAction.getFullPoolDescription(this.obs.playingPool)}</div>
                {this.getTimeElement()}
                {this.getPlayingTeamElement()}
                <button disabled={Interfaces.head.isDuringRoutineTime() || this.obs.playingTeamIndex === undefined} className="startButton" onClick={() => this.onStartButtonClick()}>
                    {this.getStartButtonText()}
                </button>
                <button disabled={!this.obs.isJudging} className="startButton" onClick={() => this.onStopButtonClick()}>
                    Stop
                </button>
                {this.getTeamsElement()}
            </div>
        )
    }
}
