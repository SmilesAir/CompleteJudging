
const React = require("react")
const MobxReact = require("mobx-react")

const DataAction = require("scripts/actions/dataAction.js")

require("./resultsView.less")

module.exports = @MobxReact.observer class ResultsView extends React.Component {
    constructor(props) {
        super(props)
    }

    getTeamResults() {
        let teamNamesList = []
        for (let judgeData of this.props.pool.results) {
            for (let teamIndex = 0; teamIndex < judgeData.data.teamScoreList.length; ++teamIndex) {
                let teamData = judgeData.data.teamList[teamIndex]

                let teamNames = DataAction.getTeamPlayers(teamData)
                if (!teamNamesList.includes(teamNames)) {
                    teamNamesList.push(teamNames)
                }
            }
        }

        let results = DataAction.getResultsProcessed(this.props.pool)

        let columns = []
        let teamElements = [ <div key="header1" className="team">-----</div>, <div key="header2" className="team">-----</div> ]
        for (let teamName of teamNamesList) {
            teamElements.push(
                <div key={teamName} className="team">
                    {teamName}
                </div>
            )
        }

        columns.push(
            <div key="teams" className="column">
                {teamElements}
            </div>
        )

        let judgeOutputList = []
        for (let teamNames in results) {
            let teamDataList = results[teamNames]
            for (let data of teamDataList) {
                if (data.judgeName !== undefined && judgeOutputList.findIndex((judgeOutput) => {
                    return judgeOutput.judgeName === data.judgeName
                }) === -1) {
                    let descList = []
                    for (let processedData of data.processed) {
                        for (let descName in processedData) {
                            descList.push(descName)
                        }
                    }

                    judgeOutputList.push({
                        judgeName: data.judgeName,
                        descList: descList
                    })
                }

                if (data.processed !== undefined) {
                    let judgeOutput = judgeOutputList.find((out) => {
                        return data.judgeName === out.judgeName
                    })

                    let valueList = []
                    for (let processedData of data.processed) {
                        for (let descName in processedData) {
                            valueList.push(processedData[descName].toFixed(2))
                        }
                    }

                    judgeOutput.valueList = judgeOutput.valueList || []
                    judgeOutput.valueList.push(valueList)
                }
            }
        }

        for (let judgeOutput of judgeOutputList) {
            columns.push(
                <div key={judgeOutput.judgeName} className="column">
                    <div className="judge">{judgeOutput.judgeName}</div>
                    <div className="descriptionContainer">
                        {judgeOutput.descList.map((desc) => {
                            return <div key={desc} className="description">{desc}</div>
                        })}
                    </div>
                    {judgeOutput.valueList.map((teamValueList) => {
                        return (
                            <div key={teamValueList} className="valueContainer">
                                {teamValueList.map((value) => {
                                    return <div key={value} className="value">{value}</div>
                                })}
                            </div>
                        )
                    })}
                </div>
            )
        }

        console.log(results)

        return columns
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
                    {this.getTeamResults()}
                </div>
            </div>
        )
    }
}
