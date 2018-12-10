const React = require("react")
const MobxReact = require("mobx-react")

const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./diffInspectorView.less")

module.exports = @MobxReact.observer class extends InterfaceModelBase {
    constructor(props) {
        super(props)

        this.state = {
            moveCount: 0
        }
    }

    getScoresElement() {
        let teamElements = []
        let pool = Interfaces.diffInspector.obs.playingPool
        if (pool !== undefined) {
            for (let i = 0; i < pool.teamList.length; ++i) {
                teamElements.push(<TeamScoresView key={i} teamIndex={i} />)
            }
        }

        return (
            <div className="scores">
                {teamElements}
            </div>
        )
    }

    render() {
        return (
            <div className="diffInspectorContainer">
                {this.getScoresElement()}
                <div className="controls">
                </div>
            </div>
        )
    }
}

@MobxReact.observer class TeamScoresView extends React.Component {
    constructor(props) {
        super(props)

        this.teamIndex = props.teamIndex
        this.team = Interfaces.diffInspector.obs.playingPool.teamList[this.teamIndex]
        this.playersNames = DataAction.getTeamPlayers(this.team)
    }

    getResults() {
        if (Interfaces.diffInspector.obs.results !== undefined) {
            return Interfaces.diffInspector.obs.results.map((judgeResult) => {
                return judgeResult.data.type === Enums.EInterface.diff ? DataAction.getResultsInspected(judgeResult, this.teamIndex) : undefined
            })
        }

        return undefined
    }

    render() {
        return (
            <div className="teamContainer">
                <div>
                    {this.playersNames}
                </div>
                {this.getResults()}
            </div>
        )
    }
}
