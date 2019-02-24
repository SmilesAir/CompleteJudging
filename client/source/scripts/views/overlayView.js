
const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const Interfaces = require("scripts/interfaces/interfaces.js")

require("./overlayView.less")

@MobxReact.observer class OverlayView extends React.Component {
    constructor() {
        super()

        this.state = {
            enabled: false
        }
    }

    getHeader() {
        return (
            <div className="header">
                <div>
                    {MainStore.tournamentName}
                </div>
                <div>
                    {MainStore.userId}
                </div>
                <div className="backupControlsContainer">
                    <button onClick={() => this.onBackupModeEnableClick()}>{MainStore.interfaceObs.backupModeEnabled ? "Disable Backup Mode" : "Enabled Backup Mode"}</button>
                    <button disabled={!MainStore.interfaceObs.backupModeEnabled} onClick={() => Interfaces.activeInterface.moveToNewerBackup()}>Newer</button>
                    <button disabled={!MainStore.interfaceObs.backupModeEnabled} onClick={() => Interfaces.activeInterface.moveToOlderBackup()}>Older</button>
                </div>
            </div>
        )
    }

    onBackupModeEnableClick() {
        MainStore.interfaceObs.backupModeEnabled = !MainStore.interfaceObs.backupModeEnabled

        if (MainStore.interfaceObs.backupModeEnabled) {
            Interfaces.activeInterface.initBackupMode()
        }
    }

    getInfo() {
        let teamViews = []
        if (MainStore.interfaceObs !== undefined && MainStore.interfaceObs.playingPool !== undefined) {
            let key = 0
            teamViews = MainStore.interfaceObs.playingPool.teamList.map((team) => {
                let isEditing = MainStore.interfaceObs.editTeamIndex === key
                let isPlaying = MainStore.interfaceObs.playingTeamIndex === key
                let teamIndex = key
                return (
                    <div
                        key={key++}
                        className={`teamContainer ${isPlaying ? "playing" : ""}`}
                        onPointerUp={() => {
                            if (teamIndex === MainStore.interfaceObs.playingTeamIndex) {
                                MainStore.interfaceObs.editTeamIndex = undefined
                            } else {
                                MainStore.interfaceObs.editTeamIndex = teamIndex
                            }

                            Interfaces.activeInterface.fillWithResults()
                        }}>
                        {DataAction.getTeamPlayers(team)}{isEditing ? " - EDITING" : ""}
                    </div>
                )
            })
        }

        return (
            <div className="info">
                {teamViews}
            </div>
        )
    }

    getInputComponent() {
        return <div className="overlayInputContainer"
            onMouseDown={(event) => this.onPointerDown(event)}/>
    }

    onPointerDown() {
        this.state.enabled = !this.state.enabled
        this.setState(this.state)
    }
    
    render() {
        if (this.state.enabled) {
            return (
                <div className="overlayContainer">
                    {this.getInputComponent()}
                    {this.getHeader()}
                    {this.getInfo()}
                </div>
            )
        } else {
            return this.getInputComponent()
        }
    }
}
module.exports = OverlayView

@MobxReact.observer class TeamView extends React.Component {
    constructor() {
        super()

        this.team = this.props.team
    }

    render() {
        return (
            <div className="teamContainer">
                {/* {this.team.} */}
            </div>
        )
    }
}
