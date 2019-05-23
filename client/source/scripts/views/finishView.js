
const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const DataStore = require("scripts/stores/dataStore.js")
const NumberLinePickerView = require("scripts/views/numberLinePickerView.js")
const CommonAction = require("scripts/actions/commonAction.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const Enums = require("scripts/stores/enumStore.js")

require("./finishView.less")

@MobxReact.observer class FinishView extends React.Component {
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
            </div>
        )
    }

    getTeamText(playersList, teamIndex) {
        let scoreString = ""
        let results = MainStore.interfaceObs.results
        if (results !== undefined) {
            scoreString = DataStore.dataModel.getGeneralImpressionSummary(results, teamIndex)
        }

        return DataAction.getTeamPlayersShort(playersList) + scoreString
    }

    getInfo() {
        let teamViews = []
        if (MainStore.interfaceObs !== undefined && MainStore.interfaceObs.playingPool !== undefined) {
            let key = 0
            teamViews = MainStore.interfaceObs.playingPool.teamList.map((playersList) => {
                let isPlaying = MainStore.interfaceObs.playingTeamIndex === key
                let teamIndex = key
                return (
                    <div
                        key={key++}
                        className={`teamContainer ${isPlaying ? "playing" : ""}`}
                        onClick={() => this.onTeamSelected(teamIndex)}>
                        {this.getTeamText(playersList, teamIndex)}
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
        return (
            <div className="finishInputContainer" onClick={(event) => this.onPointerDown(event)}>
                Click To Finish
            </div>
        )
    }

    onPointerDown(event) {
        event.preventDefault()

        this.state.enabled = !this.state.enabled
        MainStore.isFinishViewShowing = this.state.enabled
        this.setState(this.state)
    }

    onInputEnd(number) {
        CommonAction.vibrateSingleMedium()

        DataStore.dataModel.setCurrentTeamGeneral(number)

        Interfaces.activeInterface.reportScores()

        this.forceUpdate()
    }

    onFinishClick() {
        Interfaces.activeInterface.needShowFinishView = false

        Interfaces.activeInterface.sendState(Enums.EStatus.finished)
        
        this.state.enabled = false
        MainStore.isFinishViewShowing = this.state.enabled
        this.setState(this.state)
    }
    
    render() {
        if (this.state.enabled) {
            return (
                <div className="finishContainer">
                    {this.getHeader()}
                    {this.getInfo()}
                    <div className="instruction">Enter General Impression Score</div>
                    <NumberLinePickerView className="input" onInputEnd={(event) => this.onInputEnd(event)}/>
                    <button className="finish" onClick={() => this.onFinishClick()}>Finished</button>
                </div>
            )
        } else if (MainStore.isRoutineTimeElapsed && Interfaces.activeInterface.needShowFinishView) {
            return this.getInputComponent()
        } else {
            return null
        }
    }
}
module.exports = FinishView
