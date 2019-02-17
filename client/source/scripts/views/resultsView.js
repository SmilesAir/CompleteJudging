
const React = require("react")
const MobxReact = require("mobx-react")

require("./resultsView.less")

module.exports = @MobxReact.observer class ResultsView extends React.Component {
    constructor(props) {
        super(props)
    }

    getTeamResults() {
        let results = this.props.resultsData
        let teamNamesList = []
        for (let team in results) {
            if (!teamNamesList.includes(team)) {
                teamNamesList.push(team)
            }
        }

        let columns = []
        let teamElements = [ <div key="header1" className="team">-</div>, <div key="header2" className="team">-</div> ]
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
        let totalScoreList = undefined
        for (let teamNames in results) {
            let teamDataList = results[teamNames]
            for (let data of teamDataList) {
                if (data.judgeName === undefined) {
                    if (totalScoreList === undefined) {
                        totalScoreList = []

                        judgeOutputList.push({
                            judgeName: "---",
                            descList: [ {
                                descName: "Total Score",
                                valueList: totalScoreList
                            } ]
                        })
                    }
                    
                    totalScoreList.push(data.TotalScore.toFixed(2))

                } else if (judgeOutputList.findIndex((judgeOutput) => {
                    return judgeOutput.judgeName === data.judgeName
                }) === -1) {
                    let descList = []
                    for (let processedData of data.processed) {
                        for (let descName in processedData) {
                            descList.push({
                                descName: descName,
                                valueList: []
                            })
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

                    for (let processedData of data.processed) {
                        for (let descName in processedData) {
                            let valueList = judgeOutput.descList.find((descOutput) => {
                                return descOutput.descName === descName
                            }).valueList

                            let value = processedData[descName] || 0
                            let outValue = undefined
                            if (isNaN(value) || Number.isInteger(value)) {
                                outValue = value
                            } else {
                                outValue = value.toFixed(2)
                            }
                            valueList.push(outValue)
                        }
                    }
                }
            }
        }

        for (let judgeOutput of judgeOutputList) {
            columns.push(
                <div key={judgeOutput.judgeName} className="column">
                    <div className="judge">{judgeOutput.judgeName}</div>
                    <div className="descriptionContainer">
                        {judgeOutput.descList.map((descOutput) => {
                            let valueElements = descOutput.valueList.map((value) => {
                                return <div key={value + Math.random()} className="value">{value}</div>
                            })

                            return (
                                <div key={"container-" + descOutput.descName}>
                                    <div key={descOutput.descName} className="description">{descOutput.descName}</div>
                                    {valueElements}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return columns
    }

    render() {
        if (this.props.title === undefined || this.props.resultsData === undefined) {
            return (
                <div>
                    Set results from Pools tab
                </div>
            )
        }

        return (
            <div className="resultsContainer">
                <div className="header">
                    {this.props.title}
                </div>
                <div className="content">
                    {this.getTeamResults()}
                </div>
            </div>
        )
    }
}
