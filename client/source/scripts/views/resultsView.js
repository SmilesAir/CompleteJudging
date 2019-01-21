
const React = require("react")
const MobxReact = require("mobx-react")

const DataAction = require("scripts/actions/dataAction.js")

require("./resultsView.less")

module.exports = @MobxReact.observer class ResultsView extends React.Component {
    constructor(props) {
        super(props)
    }

    getTeamRows() {
        let results = {}
        let teamNamesList = []

        for (let judgeData of this.props.pool.results) {
            for (let teamIndex = 0; teamIndex < judgeData.data.teamScoreList.length; ++teamIndex) {
                let teamData = judgeData.data.teamList[teamIndex]

                let teamNames = DataAction.getTeamPlayers(teamData)
                if (!teamNamesList.includes(teamNames)) {
                    teamNamesList.push(teamNames)
                }
                results[teamNames] = results[teamNames] || []
                let resultData = results[teamNames]

                resultData.push({
                    judgeName: judgeData.judgeName,
                    processed: DataAction.getResultsProcessed(judgeData.data, teamIndex)
                })
            }
        }

        let rows = []
        for (let teamName of teamNamesList) {
            let teamData = results[teamName]
            rows.push(
                <div className="team">
                    {teamName} - {JSON.stringify(teamData)}
                </div>
            )
        }

        return rows
    }

    render() {
        if (this.props.pool === undefined || this.props.pool.results === undefined) {
            return (
                <div>
                    Set results from Pools tab
                </div>
            )
        }

        return (
            <div className="resultsContainer">
                <div className="header">
                    Results for {DataAction.getFullPoolDescription(this.props.pool)}
                </div>
                <div className="content">
                    {this.getTeamRows()}
                </div>
            </div>
        )
    }
}
