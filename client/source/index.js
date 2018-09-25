"use strict"

const React = require("react")
const ReactDOM = require("react-dom")
import { observer } from "mobx-react"

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")

require("./index.less")

@observer class Main extends React.Component {
    constructor() {
        super()

        let url = new URL(window.location.href)
        let startupParam = url.searchParams.get("startup")

        MainStore.activeInterface = Enums.EInterface.default

        for (let interfaceName in Enums.EInterface) {
            if (interfaceName === startupParam) {
                MainStore.activeInterface = Enums.EInterface[interfaceName]
                break
            }
        }
    }

    render() {
        let activeInterface = undefined

        switch (MainStore.activeInterface) {
        case Enums.EInterface.default:
            activeInterface = <DefaultInterface />
            break
        case Enums.EInterface.head:
            activeInterface = <HeadJudgeInterface />
            break
        case Enums.EInterface.ai:
            activeInterface = <AiJudgeInterface />
            break
        case Enums.EInterface.diff:
            activeInterface = <DiffJudgeInterface />
            break
        case Enums.EInterface.ex:
            activeInterface = <ExJudgeInterface />
            break
        }

        return (
            <div className="mainContainer">
                <div>Freestyle Players Association Judging System</div>
                <TournamentSelection />
                {activeInterface}
            </div>
        )
    }
}

@observer class TournamentSelection extends React.Component {
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

class DefaultInterface extends React.Component {
    click(newInterface) {
        MainStore.activeInterface = newInterface
    }

    render() {

        return (
            <div className="defaultInterfaceContainer">
                <button onClick={() => {this.click(Enums.EInterface.head)}}>Head Judge</button>
                <button onClick={() => {this.click(Enums.EInterface.ai)}}>Artistic Impression Judge</button>
                <button onClick={() => {this.click(Enums.EInterface.diff)}}>Difficulty Judge</button>
                <button onClick={() => {this.click(Enums.EInterface.ex)}}>Execution Judge</button>
            </div>
        )
    }
}

class HeadJudgeInterface extends React.Component {
    render() {
        return <div>Head Judge</div>
    }
}


class AiJudgeInterface extends React.Component {
    render() {
        return <div>Artistic Impression Judge</div>
    }
}


class DiffJudgeInterface extends React.Component {
    render() {
        return <div>Difficulty Judge</div>
    }
}


class ExJudgeInterface extends React.Component {
    render() {
        return <div>Execution Judge</div>
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById("mount")
)
