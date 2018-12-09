
const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

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
            </div>
        )
    }

    getInfo() {
        let teamViews = []

        if (MainStore.interfaceObs !== undefined && MainStore.interfaceObs.playingPool !== undefined) {
            let key = 0
            teamViews = MainStore.interfaceObs.playingPool.teamList.map((team) => {
                return (
                    <div key={key++} className="teamContainer">
                        {DataAction.getTeamPlayers(team)}
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
        return <div className="overlayInputContainer" onPointerDown={(event) => this.onPointerDown(event)}/>
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
