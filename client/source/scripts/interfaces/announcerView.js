const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./announcerView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.interface = Interfaces.announcer
        this.obs = this.interface.obs

        this.holdReadyMs = 500

        this.state = {
            buttonDownTime: 0,
            buttonDown: false,
            cancelTapCount: 0
        }
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
        this.interface.setPlayingTeam(teamData)
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
        this.interface.onStartClick()
    }

    onStopButtonClick() {
        this.interface.onStopClick()
    }

    getButtonText() {
        if (this.obs.playingTeamIndex === undefined) {
            return "Set Playing Team"
        } else if (this.obs.isJudging) {
            if (this.interface.hasRoutineTimeElapsed()) {
                return "Judging Finished. Wait for Judges, then TAP to READY"
            } else {
                return "Judging Active. TAP repeatedly to STOP"
            }
        } else if (this.isButtonReady()) {
            return "READY. Release on First Throw"
        } else {
            return "HOLD to READY"
        }
    }

    isButtonReady() {
        return this.state.buttonDownTime >= this.holdReadyMs
    }

    onPassiveButtonClick() {
        this.interface.setPassiveMode(!this.obs.passiveMode)
    }

    updateWhenMainButtonDown() {
        if (this.obs.playingTeamIndex === undefined) {
            // Do nothing
        } else if (this.obs.isJudging) {
            if (this.interface.hasRoutineTimeElapsed()) {
                this.interface.stopRoutine()
                this.interface.moveToNextTeam()
            } else {
                ++this.state.cancelTapCount
                this.setState(this.state)

                if (this.state.cancelTapCount > 3) {
                    this.interface.stopRoutine()
                }
            }
        } else {
            this.state.buttonDownTime += 50
            this.state.buttonDown = true
            this.setState(this.state)
        }
    }

    onMainButtonDown() {
        this.updateHandle = setInterval(() => {
            this.updateWhenMainButtonDown()
        }, 50)
    }

    onMainButtonUp() {
        if (this.isButtonReady()) {
            this.startRoutine()
        }

        clearInterval(this.updateHandle)

        this.state.buttonDownTime = 0
        this.state.buttonDown = false
        this.setState(this.state)
    }

    onMainButtonLeave() {
        clearInterval(this.updateHandle)

        this.state.buttonDownTime = 0
        this.state.buttonDown = false
        this.setState(this.state)
    }

    startRoutine() {
        this.state.cancelTapCount = 0

        this.interface.startRoutine()
    }

    render() {
        if (this.obs.playingPool === undefined) {
            return <div className="headTopContainer">Set playing pool for Head Judge to function</div>
        }

        let downScaler = Math.min(1, this.state.buttonDownTime / this.holdReadyMs)

        let mainButtonStyle = {
            backgroundColor: this.state.buttonDown ? `rgb(100, ${100 + 155 * downScaler}, 100)` : "gainsboro"
        }

        return (
            <div className="announcerTopContainer">
                <div className="header">
                    <div>
                        Announcer
                    </div>
                    <button className="passiveButton" onClick={() => this.onPassiveButtonClick()}>{this.obs.passiveMode ? "Disable Passive Mode" : "Enable Passive Mode"}</button>
                </div>
                <div className="poolDetailsContainer">{DataAction.getFullPoolDescription(this.obs.playingPool)}</div>
                {this.getTimeElement()}
                {this.getPlayingTeamElement()}
                <div className="mainButton" style={mainButtonStyle}
                    onPointerDown={() => this.onMainButtonDown()}
                    onPointerUp={() => this.onMainButtonUp()}
                    onPointerLeave={() => this.onMainButtonLeave()}>{this.getButtonText()}</div>
                {this.getTeamsElement()}
            </div>
        )
    }
}
