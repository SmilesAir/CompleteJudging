const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const MainStore = require("scripts/stores/mainStore.js")

require("./scoreboardView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.interface = Interfaces.scoreboard
        this.obs = this.interface.obs

        this.queryResults()

        setInterval(() => {
            this.queryResults()
        }, 1000)
    }

    queryResults() {
        fetch(`https://s3-us-west-2.amazonaws.com/completejudging-results/${MainStore.tournamentName.replace(" ", "+")}-results.json`, {
            method: "GET",
            headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            this.resultsData = response.data
            this.title = response.title
            this.incremental = response.incremental

            this.forceUpdate()
        }).catch(() => {
            // Nothing
        })
    }

    getIncrementalHeaderRow() {
        return (
            <div key={0} className="rowContainer headerRow rowContainerIncremental">
                <div>{"#"}</div>
                <div>{"Team"}</div>
                <div>{"Phrases"}</div>
                <div>{"Unique"}</div>
                <div>{"Diff"}</div>
                <div>{"Ex"}</div>
                <div>{"Score"}</div>
            </div>
        )
    }

    getHeaderRow() {
        return (
            <div key={0} className="rowContainer headerRow">
                <div>{"#"}</div>
                <div>{"Team"}</div>
                <div>{"Phrases"}</div>
                <div>{"Unique"}</div>
                <div>{"Diff"}</div>
                <div>{"Variety"}</div>
                <div>{"AI"}</div>
                <div>{"Ex"}</div>
                <div>{"Score"}</div>
            </div>
        )
    }

    getIncrementalRow(rank, teamNames, phraseCount, unique, diff, ex, totalScore) {
        return (
            <div key={teamNames} className="rowContainer rowContainerIncremental">
                <div className="rank">{rank}</div>
                <div className="teamNames">{teamNames}</div>
                <div className="phraseCount">{phraseCount}</div>
                <div className="unique">{unique}</div>
                <div className="diff">{diff}</div>
                <div className="ex">{ex}</div>
                <div className="score">{totalScore}</div>
            </div>
        )
    }

    getRow(rank, teamNames, phraseCount, unique, diff, variety, ai, ex, totalScore) {
        return (
            <div key={teamNames} className="rowContainer">
                <div className="rank">{rank}</div>
                <div className="teamNames">{teamNames}</div>
                <div className="phraseCount">{phraseCount}</div>
                <div className="unique">{unique}</div>
                <div className="diff">{diff}</div>
                <div className="variety">{variety}</div>
                <div className="ai">{ai}</div>
                <div className="ex">{ex}</div>
                <div className="score">{totalScore}</div>
            </div>
        )
    }

    getBoard(data) {
        let rowList = []

        rowList.push(this.incremental ? this.getIncrementalHeaderRow() : this.getHeaderRow())

        for (let rowData of data) {
            let teamData = rowData.data
            rowList.push(this.incremental ?
                this.getIncrementalRow(rowData.data.rank, rowData.teamNames, teamData.phrases, teamData.unique, teamData.diff.toFixed(2), -teamData.ex.toFixed(2), teamData.totalScore.toFixed(2)) :
                this.getRow(rowData.data.rank, rowData.teamNames, teamData.phrases, teamData.unique, teamData.diff.toFixed(2), teamData.variety.toFixed(2), teamData.ai.toFixed(2), -teamData.ex.toFixed(2), teamData.totalScore.toFixed(2)))
        }

        return rowList
    }

    render() {
        if (this.resultsData === undefined) {
            return <div>No Scoreboard Data</div>
        }

        return (
            <div className="scoreboardTopContainer">
                <div>
                    {this.title}
                </div>
                {this.getBoard(this.resultsData)}
            </div>
        )
    }
}
