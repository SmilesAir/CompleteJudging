/* eslint-disable no-loop-func */

const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const EndpointStore = require("complete-judging-common/source/endpoints.js")
const DataAction = require("scripts/actions/dataAction.js")
const MainStore = require("scripts/stores/mainStore.js")

require("./adminView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor(props) {
        super(props)

        this.state = {
            exporterTournamentName: "",
            exportedResultsText: [],
            exportInProgress: false
        }
    }

    saveFile(filename, text) {
        let element = document.createElement("a")
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
        element.setAttribute("download", filename)

        element.style.display = "none"
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)
    }

    exportAndDownloadAllData(isProd) {
        fetch("https://xvbh62vfdj.execute-api.us-west-2.amazonaws.com/development/getExportedData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json()).then((response) => {
            console.log(response)
            this.saveFile("AllFrisbeeData.json", JSON.stringify(response.data))
        }).catch((error) => {
            console.error("getExportedData error: " + error)
        })
    }

    exporterTournamentNameChanged(e) {
        this.state.exporterTournamentName = e.target.value

        this.setState(this.state)
    }

    compareName(str1, str2) {
        return str1.trim().toUpperCase() === str2.trim().toUpperCase()
    }

    findPlayerKey(plainName, playerData) {
        let nameParts = plainName.split(/ (.+)?/, 2)

        for (let playerKey in playerData) {
            let player = playerData[playerKey]
            if (nameParts.length > 1 && this.compareName(player.firstName, nameParts[0]) && this.compareName(player.lastName, nameParts[1])) {
                return playerKey
            }
        }

        return undefined
    }

    async onExportToText() {
        this.state.exportInProgress = true
        this.setState(this.state)

        MainStore.tournamentName = this.state.exporterTournamentName
        let playerData = undefined

        await fetch("https://4wnda3jb78.execute-api.us-west-2.amazonaws.com/production/getAllPlayers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            playerData = response.players
        })

        await fetch(EndpointStore.buildUrl(false, "IMPORT_TOURNAMENT_DATA", {
            tournamentName: this.state.exporterTournamentName
        }), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then(async(response) => {
            let tournamenData = this.state.tournamentData = response
            this.state.exportedResultsText = []
            MainStore.saveData = DataAction.loadDataFromPoolCreator(response.tournamentInfo)

            let sortedPoolKeys = []
            for (let poolKey in tournamenData.tournamentKey) {
                if (poolKey.startsWith("pool-")) {
                    sortedPoolKeys.push(poolKey)
                }
            }
            sortedPoolKeys = sortedPoolKeys.sort()

            let divisionIndex = undefined
            let roundIndex = undefined
            let lines = []
            for (let poolKey of sortedPoolKeys) {
                let keyParts = poolKey.split("-")
                if (keyParts.length === 4) {
                    let pool = {
                        divisionIndex: parseInt(keyParts[1], 10),
                        roundIndex: parseInt(keyParts[2], 10),
                        poolIndex: parseInt(keyParts[3], 10)
                    }
                    let divisionName = {
                        0: "Open Pairs",
                        1: "Mixed Pairs",
                        2: "Open Co-op",
                        3: "Women Pairs",
                    }[pool.divisionIndex]

                    if (divisionIndex !== pool.divisionIndex) {
                        if (divisionIndex !== undefined) {
                            lines.push("end")
                            this.state.exportedResultsText.push(lines.join("\n"))
                        }

                        divisionIndex = pool.divisionIndex
                        lines = [ `start pools "${tournamenData.tournamentInfo.tournamentName}" "${divisionName}"` ]
                    }

                    if (roundIndex !== pool.roundIndex) {
                        roundIndex = pool.roundIndex
                        lines.push(`round ${pool.roundIndex + 1}`)
                    }

                    let poolLetter = String.fromCharCode("A".charCodeAt(0) + pool.poolIndex)
                    lines.push(`pool ${poolLetter}`)
                    await DataAction.fillPoolResults(pool, true)
                    let results = DataAction.getFullResultsProcessed(pool, 180)

                    for (let result of results) {
                        let plainNames = result.teamNames.split(" - ")
                        let playerKeys = plainNames.map((plainName) => {
                            return this.findPlayerKey(plainName, playerData) || plainName.toLowerCase().replace(" ", "_")
                        })

                        lines.push(`${result.rank} ${playerKeys.join(" ")} ${result.totalScore}`)
                    }
                }
            }

            if (divisionIndex !== undefined) {
                lines.push("end")
                this.state.exportedResultsText.push(lines.join("\n"))
            }
        }).catch((error) => {
            console.log("Error: Export Results", error)
        }).finally(() => {
            this.state.exportInProgress = false
            this.setState(this.state)
        })
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
    }

    getElectronicJudgingExporterWidget() {
        return (
            <div>
                <label>
                    Tournament Name:
                    <input value={this.state.exporterTournamentName} onChange={(e) => this.exporterTournamentNameChanged(e)}/>
                </label>
                <button onClick={(e) => this.onExportToText(e)} disabled={this.state.exportInProgress}>{this.state.exportInProgress ? "Working..." : "Export to Text"}</button>
                {
                    this.state.exportedResultsText.map((text, index) => {
                        return (
                            <div key={index} className="exportTextContainer">
                                <button onClick={() => this.copyToClipboard(text)}>Copy to Clipboard</button>
                                <textarea value={text} cols={70} rows={10} readOnly={true} />
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        return (
            <div className="adminContainer">
                <h1>
                    Admin Panel
                </h1>
                <div>
                    <div className="section">
                        <h1>
                            Electronic Judging Results Exporter
                        </h1>
                        {this.getElectronicJudgingExporterWidget()}
                    </div>
                    <div className="section">
                        <h1>
                            Export and Download All Data
                        </h1>
                        <div>
                            <button onClick={() => this.exportAndDownloadAllData(false)}>Development</button>
                            <button onClick={() => this.exportAndDownloadAllData(true)}>Production</button>
                        </div>
                    </div>
                    <div className="section">
                        <h1>
                            Player Name Tools
                        </h1>
                        <iframe src="https://player-name-service-production.s3.us-west-2.amazonaws.com/index.html" frameBorder="0" style={{ height: "68em" }} allow="clipboard-write"/>
                    </div>
                    <div className="section">
                        <h1>
                            Event Summary Tools
                        </h1>
                        <iframe src="https://event-summary-service-production.s3.us-west-2.amazonaws.com/index.html" frameBorder="0" allow="clipboard-write"/>
                    </div>
                    <div className="section">
                        <h1>
                            Event Results Tools
                        </h1>
                        <iframe src="https://event-results-service-production.s3.us-west-2.amazonaws.com/index.html" frameBorder="0" style={{ height: "45em" }} allow="clipboard-write"/>
                    </div>
                    <div className="section">
                        <h1>
                            Points Tools
                        </h1>
                        <iframe src="https://points-service-production.s3.us-west-2.amazonaws.com/index.html" frameBorder="0" style={{ height: "57em" }} allow="clipboard-write"/>
                    </div>
                </div>
            </div>
        )
    }
}
