
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
            </div>
        )
    }

    getInfo() {
        let activeInterface = Interfaces.list[MainStore.activeInterface]
        let playingIndex = activeInterface !== undefined && activeInterface.obs !== undefined ? activeInterface.obs.playingTeamIndex : undefined

        let teamViews = []
        if (MainStore.interfaceObs !== undefined && MainStore.interfaceObs.playingPool !== undefined) {
            let key = 0
            teamViews = MainStore.interfaceObs.playingPool.teamList.map((team) => {
                return (
                    <div key={key++} className={`teamContainer ${playingIndex === key - 1 ? "playing" : ""}`}>
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
