const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./judgeView.less")

module.exports = @MobxReact.observer class extends ModelInterfaceBase {
    constructor() {
        super()

        this.startTime = undefined
    }

    getTeams() {
        let i = 0
        return Interfaces.rank.obs.playingPool.teamList.map((team) => {
            return <TeamView team={team} teamIndex={i} key={i++}/>
        })
    }

    onDragEnd(event) {
        Interfaces.rank.endScoreDrag()

        this.forceUpdate()
    }

    render() {
        if (Interfaces.rank.obs.playingPool === undefined) {
            return <div className="topContainer">Waiting for Head Judge</div>
        }

        return (
            <div className="topContainer">
                Rank Judge
                <div className="rankTeamListContainer"
                onMouseUp={(event) => this.onDragEnd(event)}
                onMouseLeave={(event) => this.onDragEnd(event)}
                onMouseUp={(event) => this.onDragEnd(event)}>
                    {this.getTeams()}
                </div>
            </div>
        )
    }
}

@MobxReact.observer class TeamView extends React.Component {
    constructor(props) {
        super(props)

        this.team = props.team
        this.teamIndex = props.teamIndex
        this.interface = Interfaces.rank
    }

    componentWillReceiveProps(props) {
        this.team = props.team
        this.teamIndex = props.teamIndex
        this.interface = Interfaces.rank
    }

    getTeamPoints() {
        return this.interface.obs.results !== undefined ? Math.round(this.interface.obs.results.rawPointsList[this.teamIndex]) : "None"
    }

    getIsPlaying() {
        return this.interface.obs.playingTeamIndex === this.teamIndex
    }

    getHasPlayed() {
        return this.team.played === true
    }

    onMouseDown(event) {
        if (this.getIsPlaying() || this.getHasPlayed()) {
            this.interface.startScoreDrag(this.teamIndex)
        }
    }

    onMouseMove(event) {
        this.interface.onScoreDrag(event)
    }

    onMouseUp(event) {
        this.interface.endScoreDrag(this.teamIndex)
    }

    getStyle() {
        if (this.getIsPlaying()) {
            return "teamTextPlaying"
        } else if (this.getHasPlayed()) {
            return "teamTextPlayed"
        } else {
            return "teamTextNotPlayed"
        }
    }

    render() {
        return (
            <div className="rankTeamContainer"
            onMouseDown={(event) => this.onMouseDown(event)}
            onMouseMove={(event) => this.onMouseMove(event)}>
                <div className={this.getStyle()}>
                    {this.team.getPlayerNamesString()}: {this.getTeamPoints()} Points
                </div>
            </div>
        )
    }
}
