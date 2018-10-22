const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")

require("./infoView.less")

module.exports = @MobxReact.observer class extends ModelInterfaceBase {
    render() {
        return (
            <div className="infoContainer">
                <input className="infoTab" id="tab1" type="radio" name="tabs" defaultChecked />
                <label className="infoLabel" htmlFor="tab1">Select</label>
                <input className="infoTab" id="tab2" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab2">Players and Teams</label>
                <input className="infoTab" id="tab3" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab3">Pools</label>
                <TournamentSelection/>
            </div>
        )
    }
}

@MobxReact.observer class TournamentSelection extends React.Component {
    constructor() {
        super()

        this.state = { tournamentInfoList: [] }

        this.refreshTournamentInfoList()
    }

    refreshTournamentInfoList() {
        this.tournamentInfoList = []

        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/getActiveTournaments",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                return response.json()
            }).then((response) => {
                this.setState({tournamentInfoList: response.tournamentInfos})
            }).catch((error) => {
                console.log("Refresh Tournament Info Error", error)
            })
    }

    selectTournament(info) {
        console.log(info)
    }

    getActiveTournamentInfoComponents() {
        return this.state.tournamentInfoList.map((info) => {
            let dateString = new Date(info.createdTime).toString()

            return (
            <label className="infoSummary" key={info.tournamentName} onClick={() => {
                this.selectTournament(info)
            }}>
                Name: {info.tournamentName} Created: {dateString}
            </label>)
        })
    }

    onSubmit(event) {
        event.preventDefault()

        fetch("https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/createTournament",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tournamentName: this.state.newTournamentName })
            }).then((response) => {
                if (response.status < 400) {
                    this.refreshTournamentInfoList()
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
            <div id="content1" className="tournamentSelectionContainer infoTabContent">
                <form onSubmit={(event) => {this.onSubmit(event)}}>
                    <label>
                        New Tournament Name:
                        <input type="text" value={this.state.value} onChange={(event) => {this.onChange(event)}}/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                <button onClick={() => {this.refreshTournamentInfoList()}}>Refresh Active Tournament List</button>
                {this.getActiveTournamentInfoComponents()}
            </div>
        )
    }
}
