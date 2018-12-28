const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./headView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()
    }

    getTimeElement() {
        let judgingTimeDate = new Date(Interfaces.head.obs.judgingTimeMs)
        let judgingTime = `${judgingTimeDate.getMinutes()}:${("0" + judgingTimeDate.getSeconds()).slice(-2)}`
        let remainingTime = DataAction.getTimeString(Math.max(0, Interfaces.head.obs.routineLengthSeconds * 1000 - Interfaces.head.obs.judgingTimeMs))

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
        let teamIndex = Interfaces.head.obs.playingTeamIndex
        if (teamIndex !== undefined && teamIndex < Interfaces.head.obs.playingPool.teamList.length) {
            teamName = Interfaces.head.obs.playingPool.teamList[teamIndex].getPlayerNamesString()
        }

        return <div>Playing Team: {teamName}</div>
    }

    onTeamClick(teamData) {
        Interfaces.head.setPlayingTeam(teamData)
    }

    getTeamsElement() {
        let teamIndex = -1
        let teamList = Interfaces.head.obs.playingPool.teamList.map((teamData) => {
            ++teamIndex
            return <div key={teamIndex} className={`teamContainer ${Interfaces.head.obs.playingTeamIndex === teamIndex ? "playing" : ""}`}
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

    render() {
        if (Interfaces.head.obs.playingPool === undefined) {
            return <div className="headTopContainer">Set playing pool for Head Judge to function</div>
        }

        return (
            <div className="headTopContainer">
                Head Judge
                <div className="poolDetailsContainer">{DataAction.getFullPoolDescription(Interfaces.head.obs.playingPool)}</div>
                {this.getTimeElement()}
                {this.getPlayingTeamElement()}
                <button className="startButton" onClick={() => this.onStartButtonClick()}>
                    {Interfaces.head.obs.isJudging ? "Judging Active" : "Click on First Throw"}
                </button>
                <button className="startButton" onClick={() => this.onStopButtonClick()}>
                    Stop
                </button>
                {this.getTeamsElement()}
            </div>
        )
    }
}
