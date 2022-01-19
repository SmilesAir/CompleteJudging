
const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataStore = require("scripts/stores/dataStore.js")
const Enums = require("scripts/stores/enumStore.js")
const LocStore = require("scripts/stores/locStore.js")
const CommonAction = require("scripts/actions/commonAction.js")


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
                    <button onClick={() => this.onOpenGeneralClick()}>{LocStore.OpenGeneralImpression}</button>
                </div>
                <div className="headerControlsContainer">
                    <button onClick={() => this.onBackupModeEnableClick()}>{MainStore.interfaceObs.backupModeEnabled ? LocStore.DisableBackupMode : LocStore.EnabledBackupMode}</button>
                    <button disabled={!MainStore.interfaceObs.backupModeEnabled} onClick={() => Interfaces.activeInterface.moveToNewerBackup()}>{LocStore.Newer}</button>
                    <button disabled={!MainStore.interfaceObs.backupModeEnabled} onClick={() => Interfaces.activeInterface.moveToOlderBackup()}>{LocStore.Older}</button>
                    <select value={LocStore.language} onChange={(event) => this.onLanguageChanged(event)}>
                        {
                            LocStore.languageChoices.map((language) => {
                                return <option key={language} value={language}>{language}</option>
                            })
                        }
                    </select>
                </div>
            </div>
        )
    }

    onLanguageChanged(event) {
        if (LocStore.language !== event.target.value) {
            CommonAction.loadAndSetLanguage(event.target.value)
        }
    }

    onOpenGeneralClick() {
        this.state.enabled = false
        this.setState(this.state)

        MainStore.isFinishViewShowing = true
    }

    onBackupModeEnableClick() {
        MainStore.interfaceObs.backupModeEnabled = !MainStore.interfaceObs.backupModeEnabled

        if (MainStore.interfaceObs.backupModeEnabled) {
            Interfaces.activeInterface.initBackupMode()
        }
    }

    onTeamSelected(teamIndex) {
        if (teamIndex === MainStore.interfaceObs.playingTeamIndex) {
            MainStore.interfaceObs.editTeamIndex = undefined
        } else {
            MainStore.interfaceObs.editTeamIndex = teamIndex
        }

        Interfaces.activeInterface.fillWithResults()
    }

    getTeamText(playersList, teamIndex) {
        let scoreString = ""
        let results = MainStore.interfaceObs.results
        if (results !== undefined) {
            scoreString = DataStore.dataModel.getOverlaySummary(results, teamIndex)
        }

        return DataAction.getTeamPlayersShort(playersList) + scoreString
    }

    getInfo() {
        let teamViews = []
        if (MainStore.interfaceObs !== undefined &&
            MainStore.interfaceObs.playingPool !== undefined &&
            MainStore.interfaceObs.playingPool.teamList !== undefined) {
            let key = 0
            teamViews = MainStore.interfaceObs.playingPool.teamList.map((playersList) => {
                let isEditing = MainStore.interfaceObs.editTeamIndex === key
                let isPlaying = MainStore.interfaceObs.playingTeamIndex === key
                let teamIndex = key
                return (
                    <div
                        key={key++}
                        className={`teamContainer ${isPlaying ? "playing" : ""}`}
                        onClick={() => this.onTeamSelected(teamIndex)}>
                        {this.getTeamText(playersList, teamIndex)}{isEditing ? " - EDITING" : ""}
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
            onClick={(event) => this.onPointerDown(event)}/>
    }

    onPointerDown() {
        if (Interfaces.activeInterface.needShowFinishView) {
            if (this.state.enabled) {
                this.state.enabled = false
                this.setState(this.state)
            } else {
                // Do nothing
            }
        } else {
            this.state.enabled = !this.state.enabled
            this.setState(this.state)
        }
    }

    render() {
        if (MainStore.activeInterface === Enums.EInterface.info ||
            MainStore.activeInterface === Enums.EInterface.head) {
            return null
        }

        // Little hacky, but disable when routine starts
        this.state.enabled &= MainStore.interfaceObs &&
            (MainStore.interfaceObs.startTime === undefined || (Date.now() - MainStore.interfaceObs.startTime) / 1000 > MainStore.interfaceObs.routineLengthSeconds)

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
