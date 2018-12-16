const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./headView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.startTime = undefined

        this.state = {
            buttonText: "Click on First Throw"
        }
    }

    getTimeElement() {
        let remainingTimeMs = Interfaces.head.obs.routineLengthSeconds * 1000
        if (this.startTime !== undefined) {
            remainingTimeMs -= Date.now() - this.startTime

            setTimeout(() => {
                this.forceUpdate()
            }, 100)
        }

        let timeDate = new Date(remainingTimeMs)

        return <div>Time Remaining: {timeDate.getMinutes()}:{timeDate.getSeconds()}</div>
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

    onButtonClick() {
        if (this.startTime === undefined) {
            this.setState({
                buttonText: "Judging Active. Triple Click to Cancel"
            })

            this.startTime = Date.now()
        }
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
                <button className="startButton" onClick={() => this.onButtonClick()}>{this.state.buttonText}</button>
                {this.getTeamsElement()}
            </div>
        )
    }
}
