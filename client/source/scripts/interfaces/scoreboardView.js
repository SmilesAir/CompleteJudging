const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const ResultsView = require("scripts/views/resultsView.js")
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
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            this.resultsData = response

            this.forceUpdate()
        }).catch(() => {
            // Nothing
        })
    }

    render() {
        if (this.resultsData === undefined) {
            return <div>No Scoreboard Data</div>
        }

        return (
            <div className="scoreboardTopContainer">
                <ResultsView title="test" resultsData={this.resultsData}/>
            </div>
        )
    }
}
