
const React = require("react")
const MobxReact = require("mobx-react")

const Enums = require("scripts/stores/enumStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const LocStore = require("scripts/stores/locStore.js")

require("./resultsView.less")

function judgeSort(a, b) {
    if (a.type === b.type) {
        return a.judgeName > b.judgeName
    } else if (a.type === Enums.EInterface.diff) {
        return -1
    } else if (b.type === Enums.EInterface.diff) {
        return 1
    } else if (a.type === Enums.EInterface.variety) {
        return -1
    } else if (b.type === Enums.EInterface.variety) {
        return 1
    }

    return 0
}

module.exports = @MobxReact.observer class ResultsView extends React.Component {
    constructor(props) {
        super(props)

        this.sortByJudge = false
        this.sortByRank = false
    }

    getScoreDetails(judgeData) {
        if (judgeData.type === Enums.EInterface.diff) {
            return (
                <div key={judgeData.judgeName} className="detailsContainer">
                    <div className="detailSingle diff">
                        {judgeData.printLabels === true ? `${LocStore.Diff} ${judgeData.judgeNumber}` : judgeData.score.toFixed(1)}
                    </div>
                </div>
            )
        } else if (judgeData.type === Enums.EInterface.variety) {
            return (
                <div key={judgeData.judgeName} className="detailsContainer">
                    <div className="detailSingle variety">
                        {judgeData.printLabels === true ? `${LocStore.Vty} ${judgeData.judgeNumber}` : judgeData.score.toFixed(1)}
                    </div>
                </div>
            )
        } else if (judgeData.type === Enums.EInterface.exAi) {
            return (
                <div key={judgeData.judgeName} className="detailsContainer">
                    <div className="detailSingle ai">
                        {judgeData.printLabels === true ? `${LocStore.AI} ${judgeData.judgeNumber}` : judgeData.score.toFixed(1)}
                    </div>
                    <div className="detailSingle ex">
                        {judgeData.printLabels === true ? `${LocStore.Ex} ${judgeData.judgeNumber}` : -judgeData.adjustedEx.toFixed(1)}
                    </div>
                </div>
            )
        }

        return null
    }

    getScoreDetailsContainer(teamData) {
        let sortedJudgeData = []
        for (let judgeName in teamData.data) {
            sortedJudgeData.push(Object.assign({
                judgeName: judgeName
            }, teamData.data[judgeName]))
        }

        sortedJudgeData.sort(judgeSort)

        let detailElements = []
        for (let judgeData of sortedJudgeData) {
            detailElements.push(this.getScoreDetails(judgeData))
        }

        if (this.labelData === undefined) {
            this.labelData = {
                data: {}
            }

            let typeCount = {}
            for (let judgeData of sortedJudgeData) {
                typeCount[judgeData.type] = (typeCount[judgeData.type] || 0) + 1
                this.labelData.data[judgeData.judgeName] = {
                    judgeName: judgeData.judgeName,
                    type: judgeData.type,
                    judgeNumber: typeCount[judgeData.type],
                    printLabels: true
                }
            }
        }

        return (
            <div className="allDetailsContainer">
                {detailElements}
                {this.getCategorySumsContainer(teamData.teamNames)}
            </div>
        )
    }

    getCategorySumsContainer(teamNames) {
        let sums = this.allTeamCategoryData[teamNames] || {}

        let diff = sums[Enums.EInterface.diff]
        diff = diff !== undefined ? diff.toFixed(1) + (diff === this.allTeamCategoryData.topDiff ? "*" : "") : `${LocStore.DiffAbbreviationSingleChar} (${MainStore.constants.diff.diffScaler})`

        let variety = sums[Enums.EInterface.variety]
        variety = variety !== undefined ? variety.toFixed(1) + (variety === this.allTeamCategoryData.topVariety ? "*" : "") : `${LocStore.VarietyAbbreviationSingleChar} (${MainStore.constants.variety.varietyScaler})`

        let ai = sums[Enums.EInterface.exAi]
        ai = ai !== undefined ? ai.toFixed(1) + (ai === this.allTeamCategoryData.topAi ? "*" : "") : `${LocStore.AI} (${MainStore.constants.exAi.aiScaler})`

        let ex = sums.ex
        ex = ex !== undefined ? ex.toFixed(1) + (ex === this.allTeamCategoryData.topEx ? "*" : "") : `${LocStore.Ex} (${MainStore.constants.exAi.exScaler})`

        let general = sums.general
        general = general !== undefined ? general.toFixed(1) + (general === this.allTeamCategoryData.topGeneral ? "*" : "") : `${LocStore.GeneralAbbreviationSingleChar} (${MainStore.constants.base.generalScaler.toString().replace(/^[0]*/, "")})`

        return (
            <div className="categorySumsContainer">
                <div className="categorySum diff">
                    {diff}
                </div>
                <div className="categorySum variety">
                    {variety}
                </div>
                <div className="categorySum ai">
                    {ai}
                </div>
                <div className="categorySum ex">
                    {ex}
                </div>
                <div className="categorySum general">
                    {general}
                </div>
            </div>
        )
    }

    getSummaryTeamRows(teamData) {
        return (
            <div key={teamData.teamNames} className="row">
                <div className="divided">
                    <div className="names">
                        {teamData.teamNames}
                    </div>
                    {this.getScoreDetailsContainer(teamData)}
                </div>
                <div className="total">
                    {typeof teamData.totalScore === "number" ? teamData.totalScore.toFixed(2) : teamData.totalScore}
                </div>
                <div className="rank">
                    {teamData.rank}
                </div>
            </div>
        )
    }

    getSummaryResults() {
        // Precalc the category top scores
        let results = this.props.resultsData
        this.allTeamCategoryData = {}
        for (let teamData of results) {
            let sums = {}
            for (let judgeName in teamData.data) {
                let judgeData = teamData.data[judgeName]
                if (judgeData.score !== undefined) {
                    // Don't include the general impression. That is a separate category in the summary table
                    sums[judgeData.type] = (sums[judgeData.type] || 0) + (judgeData.score - judgeData.generalPoints)
                }
                if (judgeData.adjustedEx !== undefined) {
                    sums.ex = (sums.ex || 0) - judgeData.adjustedEx
                }
                if (judgeData.generalPoints !== undefined) {
                    sums.general = (sums.general || 0) + judgeData.generalPoints
                }
            }

            this.allTeamCategoryData[teamData.teamNames] = sums
            this.allTeamCategoryData.topDiff = Math.max(this.allTeamCategoryData.topDiff || -1, sums[Enums.EInterface.diff] || -1)
            this.allTeamCategoryData.topVariety = Math.max(this.allTeamCategoryData.topVariety || -1, sums[Enums.EInterface.variety] || -1)
            this.allTeamCategoryData.topAi = Math.max(this.allTeamCategoryData.topAi || -1, sums[Enums.EInterface.exAi] || -1)
            this.allTeamCategoryData.topEx = Math.max(this.allTeamCategoryData.topEx || -99, sums.ex || -99)
            this.allTeamCategoryData.topGeneral = Math.max(this.allTeamCategoryData.topGeneral || -1, sums.general || -1)
        }

        // Fill out label row after data since we don't know the data yet
        this.labelData = undefined
        let teamRows = []
        teamRows.push({})

        if (this.sortByRank) {
            results = results.slice(0)
            results.sort((a, b) => {
                return b.rank - a.rank
            })
        }

        for (let team of results) {
            team.scoreDetails = "Score numbers"
            teamRows.push(this.getSummaryTeamRows(team))
        }

        teamRows[0] = this.getSummaryTeamRows(Object.assign(this.labelData, {
            teamNames: LocStore.Team,
            scoreDetails: LocStore.ScoreLabels,
            totalScore: LocStore.Total,
            rank: LocStore.Rank
        }))

        return teamRows
    }

    getMarkElements(marks, markTierList) {
        let markElements = []

        for (let index = 0; index < marks.length; ++index) {
            let mark = marks[index]
            let tier = markTierList[index]

            markElements.push(
                <div key={index} className={"mark" + (tier === 0 ? " bold" : "")}>
                    {mark}
                </div>
            )
        }

        return markElements
    }

    getJudgeTeamDetails(teamData) {
        if (teamData.type === Enums.EInterface.diff) {
            return (
                <div className="judgeDetailsContainer">
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.General}
                        </div>
                        <div className="detailSingle">
                            {teamData.general}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Phrases}
                        </div>
                        <div className="detailSingle">
                            {teamData.phraseCount}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Marks}
                        </div>
                        <div className="detailLong">
                            {this.getMarkElements(teamData.marks, teamData.markTierList)}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Average}
                        </div>
                        <div className="subLabel">
                            {LocStore.Raw}
                        </div>
                        <div className="detailSingle">
                            {teamData.averageNormal.toFixed(2)}
                        </div>
                        <div className="subLabel">
                            {LocStore.Tier1}
                        </div>
                        <div className="detailSingle">
                            {teamData.averageTier1.toFixed(2)}
                        </div>
                        <div className="subLabel">
                            {LocStore.Scaled}
                        </div>
                        <div className="detailSingle">
                            {teamData.averageTier1Adjusted.toFixed(2)}
                        </div>
                        <div className="subLabel">
                            {LocStore.Tail}
                        </div>
                        <div className="detailSingle">
                            {(teamData.tail).toFixed(2)}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {"Points"}
                        </div>
                        <div className="detailSingle">
                            {teamData.categoryOnlyScore}
                        </div>
                    </div>
                </div>
            )
        } else if (teamData.type === Enums.EInterface.variety) {
            return (
                <div className="judgeDetailsContainer">
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.General}
                        </div>
                        <div className="detailSingle">
                            {teamData.general}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Quantity}
                        </div>
                        <div className="detailSingle">
                            {teamData.quantity}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Quality}
                        </div>
                        <div className="detailSingle">
                            {teamData.quality}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {"Points"}
                        </div>
                        <div className="detailSingle">
                            {teamData.categoryOnlyScore}
                        </div>
                    </div>
                </div>
            )
        } else if (teamData.type === Enums.EInterface.exAi) {
            return (
                <div className="judgeDetailsContainer">
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.General}
                        </div>
                        <div className="detailSingle">
                            {teamData.general}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.AI}
                        </div>
                        <div className="subLabel">
                            {LocStore.Music}
                        </div>
                        <div className="detailSingle">
                            {teamData.music}
                        </div>
                        <div className="subLabel">
                            {LocStore.Teamwork}
                        </div>
                        <div className="detailSingle">
                            {teamData.teamwork}
                        </div>
                        <div className="subLabel">
                            {LocStore.Form}
                        </div>
                        <div className="detailSingle">
                            {teamData.form}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {LocStore.Ex}
                        </div>
                        <div className="subLabel">
                            .1
                        </div>
                        <div className="detailSingle">
                            {teamData.point1Count}
                        </div>
                        <div className="subLabel">
                            .2
                        </div>
                        <div className="detailSingle">
                            {teamData.point2Count}
                        </div>
                        <div className="subLabel">
                            .3
                        </div>
                        <div className="detailSingle">
                            {teamData.point3Count}
                        </div>
                        <div className="subLabel">
                            {LocStore.Raw}
                        </div>
                        <div className="detailSingle">
                            {teamData.ex.toFixed(1)}
                        </div>
                        <div className="subLabel">
                            {LocStore.Adjusted}
                        </div>
                        <div className="detailSingle">
                            {teamData.adjustedEx.toFixed(1)}
                        </div>
                    </div>
                    <div className="detailScoreLine bottomBorder">
                        <div className="label">
                            {"Points"}
                        </div>
                        <div className="detailSingle">
                            {teamData.categoryOnlyScore}
                        </div>
                    </div>
                </div>
            )
        }

        return null
    }

    getJudgeTeamRows(judgeData) {
        let rows = []
        for (let team of this.props.resultsData) {
            let teamData = judgeData[team.teamNames]

            rows.push(
                <div key={team.teamNames} className="row">
                    <div className="divided">
                        <div className="names">
                            {team.teamNames}
                        </div>
                        {this.getJudgeTeamDetails(teamData)}
                    </div>
                    <div className="total">
                        {teamData.score.toFixed(2)}
                    </div>
                    <div className="rank">
                        3
                    </div>
                </div>
            )
        }

        return rows
    }

    getJudgeResults(judgeData) {
        return (
            <div key={judgeData.judgeName}>
                <div className="header">
                    {this.getJudgeTypeName(judgeData.type)}: {judgeData.judgeName}
                </div>
                <div className="content">
                    {this.getJudgeTeamRows(judgeData)}
                </div>
            </div>
        )
    }

    getJudgeDetails() {
        let judgeTableElements = []
        let results = this.props.resultsData
        let judgeDataArray = []
        for (let team of results) {
            for (let judgeName in team.data) {
                let judgeData = judgeDataArray.find((data) => {
                    return data.judgeName === judgeName
                })

                if (judgeData === undefined) {
                    judgeData = {
                        judgeName: judgeName,
                        type: team.data[judgeName].type
                    }
                    judgeDataArray.push(judgeData)
                }

                judgeData[team.teamNames] = team.data[judgeName]
            }
        }

        judgeDataArray.sort(judgeSort)

        for (let judgeData of judgeDataArray) {
            judgeTableElements.push(this.getJudgeResults(judgeData))
        }

        return judgeTableElements
    }

    getJudgeTypeName(type) {
        switch (type) {
        case Enums.EInterface.diff:
            return LocStore.Diff
        case Enums.EInterface.variety:
            return LocStore.Variety
        case Enums.EInterface.exAi:
            return LocStore.ExAi
        }

        return ""
    }

    getTeamDetailsRows(data) {
        let rows = []
        let judgeDataList = []
        for (let judgeName in data) {
            judgeDataList.push({
                judgeName: judgeName,
                judgeData: data[judgeName]
            })
        }

        judgeDataList.sort((a, b) => {
            return judgeSort(a.judgeData, b.judgeData)
        })

        for (let judge of judgeDataList) {
            rows.push(
                <div key={judge.judgeName} className="row">
                    <div className="divided">
                        <div className="names">
                            {this.getJudgeTypeName(judge.judgeData.type) + " - " + judge.judgeName}
                        </div>
                        {this.getJudgeTeamDetails(judge.judgeData)}
                    </div>
                    <div className="total">
                        {judge.judgeData.score !== undefined ? judge.judgeData.score.toFixed(2) : 0}
                    </div>
                </div>
            )
        }

        return rows
    }

    getTeamDetailedResults(teamData, playOrderNumber) {
        return (
            <div className="resultsTable" key={teamData.teamNames}>
                <div className="header">
                    {LocStore.Team} {playOrderNumber}: {teamData.teamNames}
                </div>
                <div className="content">
                    {this.getTeamDetailsRows(teamData.data)}
                </div>
            </div>
        )
    }

    getTeamDetails() {
        let teamTableElements = []
        let results = this.props.resultsData
        let playOrderNumber = 1
        for (let teamData of results) {
            teamTableElements.push(this.getTeamDetailedResults(teamData, playOrderNumber))
            ++playOrderNumber
        }

        return teamTableElements
    }

    getDetailedResults() {
        return this.sortByJudge ? this.getJudgeDetails() : this.getTeamDetails()
    }

    toggleDetailedSortMode() {
        this.sortByJudge = !this.sortByJudge
        this.forceUpdate()
    }

    toggleSummarySortMode() {
        this.sortByRank = !this.sortByRank
        this.forceUpdate()
    }

    render() {
        if (this.props.poolDesc === undefined || this.props.resultsData === undefined) {
            return (
                <div>
                    {LocStore.SetResultsFromPoolsTab}
                </div>
            )
        }

        return (
            <div className="resultsContainer">
                <button id="noPrint" className="toggleButton" onClick={() => this.toggleSummarySortMode() }>
                    {LocStore.ToggleResultsSorted}: {this.sortByRank ? LocStore.ByRank : LocStore.InPlayOrder}
                </button>
                <div className="header">
                    {this.props.poolDesc} ({LocStore.Summary})
                </div>
                <div className="content">
                    {this.getSummaryResults()}
                </div>
                <button id="noPrint" className="toggleButton" onClick={() => this.toggleDetailedSortMode() }>
                    {LocStore.ToggleResultsSorted}: {this.sortByJudge ? LocStore.ByJudge : LocStore.ByTeam}
                </button>
                {this.getDetailedResults()}
            </div>
        )
    }
}
