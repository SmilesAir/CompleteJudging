const React = require("react")
const MobxReact = require("mobx-react")
const qrCode = require("qrcode")
const JSZip = require("jszip")
const saveAs = require("file-saver").saveAs
const JSZipUtils = require("jszip-utils")

const MainStore = require("scripts/stores/mainStore.js")
const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")
const ResultsView = require("scripts/views/resultsView.js")
const CommonAction = require("scripts/actions/commonAction.js")
const EndpointStore = require("complete-judging-common/source/endpoints.js")

require("./infoView.less")


function getJudgeUrl(judgeIndex, interfaceName, isAlt) {
    let serverAddress = undefined
    if (MainStore.overrideServerIp !== undefined) {
        serverAddress = `http://${MainStore.overrideServerIp}:8080`
    } else if (__STAGE__ === "PRODUCTION") {
        serverAddress = "https://d5rsjgoyn07f8.cloudfront.net"
    } else {
        serverAddress = "https://d27wqtus28jqqk.cloudfront.net"
    }

    let url = `${serverAddress}/index.html`
    url += `?startup=${interfaceName}`
    url += `&tournamentName=${encodeURIComponent(MainStore.tournamentName)}`
    url += `&judgeIndex=${judgeIndex}`
    url += `&alt=${isAlt ? "true" : "false"}`
    url += `&lanMode=${MainStore.lanMode ? "true" : "false"}`
    url += MainStore.overrideServerIp !== undefined ? `&serverIp=${MainStore.url.searchParams.get("serverIp")}` : ""

    return url
}

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.state = {
            resultsPool: undefined
        }

        this.canvasRefs = []
    }

    gotoResultsTabActive(pool) {
        this.resultsTabRef.checked = true

        this.state.resultsPool = pool
        this.setState(this.state)
    }

    gotoQRCodesTabActive(pool, isAlt) {
        // Because QrCode is latent, generate the QR Codes next frame
        setTimeout(() => {
            for (let ref of this.canvasRefs) {
                qrCode.toCanvas(ref.ref, ref.url)
            }
        }, 1)

        this.qrCodesTabRef.checked = true

        this.state.qrCodesPool = pool
        this.state.isQrCodesAlt = isAlt
        this.setState(this.state)
    }

    printResults() {
        window.print()
    }

    getFullResultsElements() {
        if (this.state.resultsPool !== undefined && this.state.resultsPool.results !== undefined) {
            console.log(DataAction.getFullPoolDescription(this.state.resultsPool))

            return (
                <div>
                    <button id="noPrint" onClick={() => this.printResults()}>Print</button>
                    <CategoryResultsView
                        resultsData={DataAction.getCategoryResultsProcessed(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}
                        title={"Category Results for " + DataAction.getFullPoolDescription(this.state.resultsPool)}/>
                    <ResultsView
                        resultsData={DataAction.getFullResultsProcessed(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}
                        title={"Full Results for " + DataAction.getFullPoolDescription(this.state.resultsPool)}/>
                    <ResultsView
                        resultsData={DataAction.getDiffDetailedResultsProcessed(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}
                        title={"Diff Results for " + DataAction.getFullPoolDescription(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}/>
                    <ResultsView
                        resultsData={DataAction.getExAiCombinedDetailedResultsProcessed(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}
                        title={"Ex/Ai Combined Results for " + DataAction.getFullPoolDescription(this.state.resultsPool, this.state.resultsPool.routineLengthSeconds)}/>
                </div>
            )
        }

        return null
    }

    addQRCodeCanvas(rows, judgeIndex, url, fullName) {
        let rowIndex = Math.floor(judgeIndex / 3)

        rows[rowIndex] = rows[rowIndex] || []
        this.canvasRefs[judgeIndex] = {
            url: url,
            ref: undefined
        }
        rows[rowIndex].push(
            <div key={judgeIndex} className="codeContainer">
                <div className="judgeLabel">
                    {judgeIndex + 1}. {fullName}
                </div>
                <canvas className="code" ref={(ref) => this.canvasRefs[judgeIndex].ref = ref}/>
            </div>
        )
    }

    getQRCodesView() {
        let rows = []
        if (this.state.qrCodesPool !== undefined) {
            let judgeData = this.state.qrCodesPool.judgeData
            if (judgeData !== undefined) {
                let judgeIndex = 0
                judgeData.judgesEx.forEach((judge) => {
                    this.addQRCodeCanvas(rows, judgeIndex, getJudgeUrl(judgeIndex++, "oldEx", this.state.isQrCodesAlt), judge.FullName)
                })
                judgeData.judgesAi.forEach((judge) => {
                    this.addQRCodeCanvas(rows, judgeIndex, getJudgeUrl(judgeIndex++, "oldAi", this.state.isQrCodesAlt), judge.FullName)
                })
                judgeData.judgesDiff.forEach((judge) => {
                    this.addQRCodeCanvas(rows, judgeIndex, getJudgeUrl(judgeIndex++, "oldDiff", this.state.isQrCodesAlt), judge.FullName)
                })
            }
        }

        let key = 0
        let rowElements = rows.map((rowList) => {
            ++key
            return (
                <div key={key} className="qrCodeRowContainer">
                    {rowList}
                </div>
            )
        })

        return (
            <div>
                <button id="noPrint" onClick={() => this.printResults()}>Print</button>
                {rowElements}
            </div>
        )
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
                <input ref={ (ref) => this.qrCodesTabRef = ref } className="infoTab" id="tab5" type="radio" name="tabs" />
                <label className="infoLabel" htmlFor="tab5">QR Codes</label>
                <TournamentSelection/>
                <PlayerAndTeams/>
                <PoolsView gotoResultsTabActive={(pool) => this.gotoResultsTabActive(pool)} gotoQRCodesTabActive={(pool, isAlt) => this.gotoQRCodesTabActive(pool, isAlt)} />
                <div id="content4" className="infoTabContent">
                    {this.getFullResultsElements()}
                </div>
                <div id="content5" className="infoTabContent">
                    {this.getQRCodesView()}
                </div>
            </div>
        )
    }
}

@MobxReact.observer class CategoryResultsView extends React.Component {
    constructor(props) {
        super(props)
    }

    getHeaderRow() {
        return (
            <div key={0} className="rowContainer headerRow">
                <div>{"Team"}</div>
                <div>{"Diff"}</div>
                <div>{"Variety"}</div>
                <div>{"AI"}</div>
                <div>{"Ex"}</div>
                <div>{"Score"}</div>
                <div>{"Rank"}</div>
            </div>
        )
    }

    getRow(teamNames, diff, variety, ai, ex, totalScore, rank) {
        return (
            <div key={teamNames} className="rowContainer">
                <div className="teamNames">{teamNames}</div>
                <div className="diff">{diff}</div>
                <div className="variety">{variety}</div>
                <div className="ai">{ai}</div>
                <div className="ex">{ex}</div>
                <div className="score">{totalScore}</div>
                <div className="rank">{rank}</div>
            </div>
        )
    }

    getPrettyDecimalValue(value, negative) {
        return value !== undefined && value !== 0 ? (negative ? "-" : "") + value.toFixed(2) : ""
    }

    getBoard(data) {
        let rowList = []

        rowList.push(this.getHeaderRow())

        for (let rowData of data) {
            let teamData = rowData.data
            rowList.push(this.getRow(rowData.teamNames,
                this.getPrettyDecimalValue(teamData.diff),
                this.getPrettyDecimalValue(teamData.variety),
                this.getPrettyDecimalValue(teamData.ai),
                this.getPrettyDecimalValue(teamData.ex, true),
                this.getPrettyDecimalValue(teamData.totalScore),
                teamData.rank))
        }

        return rowList
    }

    render() {
        if (this.props.resultsData === undefined) {
            return <div>No Data</div>
        }

        return (
            <div className="categoryResultsContainer">
                <div className="header">
                    <div className="title">
                        {this.props.title}
                    </div>
                </div>
                {this.getBoard(this.props.resultsData)}
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

    onSetPool(pool, isAlt) {
        Interfaces.head.setupPlayingPool(pool, isAlt)
    }

    onFullResultsClick(pool) {
        DataAction.fillPoolResults(pool).then(() => {
            this.props.gotoResultsTabActive(pool)
        })
    }

    onClearResultsClick(pool) {
        if (window.confirm(`Attention!\nDo you really want to delete results for ${DataAction.getFullPoolDescription(pool)}?`)) {
            DataAction.clearPoolResults(pool)
        }
    }

    onDownloadFpaResultsSheet(pool) {
        DataAction.fillPoolResults(pool).then(() => {
            let xmlData = Interfaces.info.getFpaResultsXml(pool)

            JSZipUtils.getBinaryContent(EndpointStore.buildUrl(MainStore.lanMode, "GET_FPA_SPREADSHEET"), (error, data) => {
                if (error) {
                    console.error(error)
                } else {
                    const zip = new JSZip()
                    let resultsName = DataAction.getResultsFilename(pool)

                    zip.file(resultsName + ".xlsm", data, { binary: true })
                    zip.file("ExportData.xml", xmlData)

                    zip.generateAsync({ type: "blob" }).then((content) => {
                        saveAs(content, `${resultsName}.zip`)
                    })
                }
            })
        })
    }

    getResults(pool) {
        return (
            <div className="results">
                <div>
                    {"Results Summary   "}
                    <button onClick={() => this.onFullResultsClick(pool)}>Full Results</button>
                    <button onClick={() => this.onDownloadFpaResultsSheet(pool)}>FPA Result Sheet</button>
                    <button className="clearResultsButton" onClick={() => this.onClearResultsClick(pool)}>Clear Results</button>
                </div>
                {DataAction.getResultsSummary(pool.results)}
            </div>
        )
    }

    setLinksInClipboard(pool) {
        let linkList = []
        let judgeData = pool.judgeData
        if (judgeData !== undefined) {
            let judgeIndex = 0
            judgeData.judgesEx.forEach(() => {
                linkList.push(`${judgeIndex}: ${getJudgeUrl(judgeIndex++, "exAiCombined")}`)
            })
            judgeData.judgesAi.forEach(() => {
                linkList.push(`${judgeIndex}: ${getJudgeUrl(judgeIndex++, "variety")}`)
            })
            judgeData.judgesDiff.forEach(() => {
                linkList.push(`${judgeIndex}: ${getJudgeUrl(judgeIndex++, "diff")}`)
            })
        }

        this.copyArea.value = linkList.join("\n")
        this.copyArea.select()
        document.execCommand("copy")
    }

    generateQRCodes(pool, isAlt) {
        this.props.gotoQRCodesTabActive(pool, isAlt)
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
                            <button onClick={() => this.onSetPool(pool, true)}>Set Pool Alt</button>
                            <button onClick={() => this.setLinksInClipboard(pool)}>Copy Links</button>
                            <button onClick={() => this.generateQRCodes(pool, false)}>QR Codes</button>
                            <button onClick={() => this.generateQRCodes(pool, true)}>QR Codes Alt</button>
                        </div>
                        <div className="teams">
                            {this.getTeamComponents(pool)}
                        </div>
                        {this.getResults(pool)}
                        <textarea className="copyArea" ref={(ref) => this.copyArea = ref} />
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
                    <button onClick={() => Interfaces.info.stopPlayingPools()}>Stop Playing Pools</button>
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
                    Interfaces.info.importTournamentDataFromAWS(info)
                }}>
                    Name: {info.tournamentName} Created: {dateString}
                </label>
            )
        })
    }

    onSubmit(event) {
        event.preventDefault()

        CommonAction.fetchEx("CREATE_TOURNAMENT", undefined, undefined, {
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
                <button onClick={() => Interfaces.info.exportTournamentData()}>Export Tournament Data to AWS</button>
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


