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
                <TournamentSelection/>
            </div>
        )
    }
}

@MobxReact.observer class TournamentSelection extends React.Component {
    constructor() {
        super()

        this.state = { tournamentInfoList: [] }
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

    getActiveTournamentInfoComponents() {
        return this.state.tournamentInfoList.map((info) => {
            let dateString = new Date(info.createdTime).toString()

            return (<div key={info.tournamentName}>Tournament Name: {info.tournamentName} Created: {dateString}</div>)
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
            <div className="tournamentSelectionContainer">
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

