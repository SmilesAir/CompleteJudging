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
            return <TeamView key={i++} team={team}/>
        })
    }

    render() {
        if (Interfaces.rank.obs.playingPool === undefined) {
            return <div className="topContainer">Waiting for Head Judge</div>
        }

        return (
            <div className="topContainer">
                Rank Judge
                <div className="rankTeamListContainer">
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
    }
    render() {
        return (
            <div className="rankTeamContainer">
                <div>
                    {this.team.getPlayerNamesString()}
                </div>
            </div>
        )
    }
}
