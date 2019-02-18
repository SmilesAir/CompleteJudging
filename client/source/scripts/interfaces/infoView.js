const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")
const ResultsView = require("scripts/views/resultsView.js")

require("./infoView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.state = {
            resultsPool: undefined
        }
    }

    gotoResultsTabActive(pool) {
        this.resultsTabRef.checked = true

        this.state.resultsPool = pool
        this.setState(this.state)
    }

    printResults() {
        window.print()
    }

    getFullResultsElements() {
        if (this.state.resultsPool !== undefined && this.state.resultsPool.results !== undefined) {
            return (
                <div>
                    <button id="noPrint" onClick={() => this.printResults()}>Print</button>
                    <ResultsView
                        resultsData={DataAction.getFullResultsProcessed(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}
                        title={"Full Results for " + DataAction.getFullPoolDescription(this.state.resultsPool)}/>
                    <ResultsView
                        resultsData={DataAction.getDiffDetailedResultsProcessed(this.state.resultsPool)}
                        title={"Diff Results for " + DataAction.getFullPoolDescription(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}/>
                    <ResultsView
                        resultsData={DataAction.getExAiCombinedDetailedResultsProcessed(this.state.resultsPool)}
                        title={"Ex/Ai Combined Results for " + DataAction.getFullPoolDescription(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}/>
                </div>
            )
        }

        return null
    }

    render() {
        return (
            <div className="infoContainer">
                <input className="infoTab" id="tab1" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab1">Select</label>
                <input className="infoTab" id="tab2" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab2">Players and Teams</label>
                <input className="infoTab" id="tab3" type="radio" name="tabs" defaultChecked />
                <label className="infoLabel" htmlFor="tab3">Pools</label>
                <input ref={ (ref) => this.resultsTabRef = ref } className="infoTab" id="tab4" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab4">Results</label>
                <TournamentSelection/>
                <PlayerAndTeams/>
                <PoolsView gotoResultsTabActive={(pool) => this.gotoResultsTabActive(pool)} />
                <div id="content4" className="infoTabContent">
                    {this.getFullResultsElements()}
                </div>
            </div>
        )
    }
}

@MobxReact.observer class PlayersView extends React.Component {
    getPlayerComponents() {
        if (MainStore.saveData !== undefined) {
            let playerNumber = 1
            return MainStore.saveData.playerList.map((player) => {
                return (
                    <div key={playerNumber}>
                        {playerNumber++}. {player.firstName} {player.lastName} - {player.rank}
                    </div>
                )
            })
        } else {
            return undefined
        }
    }
    render() {
        return (
            <div className="playerListContainer">
                {this.getPlayerComponents()}
            </div>
        )
    }
}

@MobxReact.observer class PoolsView extends React.Component {
    constructor(props) {
        super(props)
    }

    getTeamComponents(pool) {
        let key = 0
        return pool.teamList.map((team) => {
            let teamNames = DataAction.getTeamPlayers(team)
            return <div key={key++}>{teamNames}</div>
        })
    }

    onSetPool(pool) {
        Interfaces.head.setPlayingPool(pool)
    }

    onFullResultsClick(pool) {
        DataAction.fillPoolResults(pool)
        this.props.gotoResultsTabActive(pool)
    }

    getResults(pool) {
        return (
            <div className="results">
                <div>
                    {"Results Summary   "}
                    <button onClick={() => this.onFullResultsClick(pool)}>See Full Results</button>
                </div>
                {DataAction.getResultsSummary(pool.results)}
            </div>
        )
    }

    getPoolComponents() {
        if (MainStore.saveData !== undefined) {
            return MainStore.saveData.poolList.map((pool) => {
                let key = `${pool.divisionIndex}${pool.roundIndex}${pool.poolIndex}`
                return (
                    <div key={key} className="poolContainer">
                        <div className="description">
                            {DataAction.getFullPoolDescription(pool)}
                        </div>
                        <div className="controls">
                            <button onClick={() => this.onSetPool(pool)}>Set Pool</button>
                            <button onClick={() => DataAction.fillPoolResults(pool)}>Get Results Summary</button>
                        </div>
                        <div className="teams">
                            {this.getTeamComponents(pool)}
                        </div>
                        {this.getResults(pool)}
                    </div>
                )
            })
        } else {
            return undefined
        }
    }

    render() {
        return (
            <div id="content3" className="infoTabContent">
                <div className="poolsContainer">
                    {this.getPoolComponents()}
                </div>
            </div>
        )
    }
}

class PlayerAndTeams extends React.Component {
    render() {
        return (
            <div id="content2" className="infoTabContent">
                <div className="content2Container">
                    <PlayersView/>
                </div>
            </div>
        )
    }
}

@MobxReact.observer class TournamentSelection extends React.Component {
    constructor() {
        super()

        this.state = { newTournamentName: "" }
    }

    selectTournament(info) {
        Interfaces.info.setInfo(info)
    }

    getActiveTournamentInfoComponents() {
        return MainStore.tournamentInfoList.map((info) => {
            let dateString = new Date(info.createdTime).toString()

            return (
                <label className="infoSummary" key={info.tournamentName} onClick={() => {
                    this.selectTournament(info)
                }}>
                    Name: {info.tournamentName} Created: {dateString}
                </label>
            )
        })
    }

    onSubmit(event) {
        event.preventDefault()

        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/createTournament", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tournamentName: this.state.newTournamentName })
        }).then((response) => {
            if (response.status < 400) {
                Interfaces.info.refreshTournamentInfoList()
            }
        }).catch((error) => {
            console.log("Create Tournament Error", error)
        })
    }

    onChange(event) {
        this.setState({ newTournamentName: event.target.value })
    }

    render() {
        return (
            <div id="content1" className="infoTabContent">
                <form onSubmit={(event) => this.onSubmit(event)}>
                    <label>
                        New Tournament Name:
                        <input type="text" value={this.state.value} onChange={(event) => {this.onChange(event)}}/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                <button onClick={() => {Interfaces.info.refreshTournamentInfoList()}}>Refresh Active Tournament List</button>
                {this.getActiveTournamentInfoComponents()}
            </div>
        )
    }
}


