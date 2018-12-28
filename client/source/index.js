"use strict"

const React = require("react")
const ReactDOM = require("react-dom")
const MobxReact = require("mobx-react")
require("favicon.ico")
//const fpaLogo = require("images/fpa_logo.png")

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")
const InfoView = require("scripts/interfaces/infoView.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const HeadJudgeInterface = require("scripts/interfaces/headView.js")
const RankView = require("scripts/interfaces/simpleRank/judgeView.js")
const DiffView = require("scripts/interfaces/fpa/diffView.js")
const VarietyView = require("scripts/interfaces/fpa/varietyView.js")
const DataAction = require("scripts/actions/dataAction.js")
const OverlayView = require("scripts/views/overlayView.js")
const DiffInspectorView = require("scripts/interfaces/fpa/diffInspectorView.js")
const ExAiCombinedView = require("scripts/interfaces/fpa/exAiCombinedView.js")

require("./index.less")

@MobxReact.observer class Main extends React.Component {
    constructor() {
        super()

        MainStore.activeInterface = Enums.EInterface.default

        let url = new URL(window.location.href)
        let startupParam = url.searchParams.get("startup")
        for (let interfaceName in Enums.EInterface) {
            if (interfaceName === startupParam) {
                MainStore.activeInterface = Enums.EInterface[interfaceName]
                break
            }
        }

        MainStore.startupTournamentName = url.searchParams.get("tournamentName")
        MainStore.userId = url.searchParams.get("userId")
        let headerParam = url.searchParams.get("header")
        MainStore.showControlsHeader = headerParam === null || headerParam === true

        DataAction.init()
        Interfaces.init()
    }

    render() {
        let classname = `mainContainer ${MainStore.showControlsHeader ? "" : "noHeader"}`

        return (
            <div className={classname}>
                <HeaderView />
                <InterfaceView />
                <OverlayView />
            </div>
        )
    }
}

@MobxReact.observer class HeaderView extends React.Component {
    getInterfaceButtons() {
        let buttons = []
        for (let interfaceName in Enums.EInterface) {
            let interfaceValue = Enums.EInterface[interfaceName]
            if (interfaceValue !== Enums.EInterface.invalid) {
                buttons.push((
                    <button key={interfaceName} onClick={ () => {
                        MainStore.activeInterface = interfaceValue
                    }}>{interfaceName}</button>
                ))
            }
        }

        return buttons
    }

    render() {
        let title = MainStore.tournamentName !== undefined ? MainStore.tournamentName : "Freestyle Players Association Judging System"
        if (MainStore.showControlsHeader) {
            return (
                <div className="headerContainer">
                    {title}
                    {this.getInterfaceButtons()}
                </div>
            )
        } else {
            return <div/>
        }
    }
}

@MobxReact.observer class InterfaceView extends React.Component {
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
            activeInterface = <DiffView />
            break
        case Enums.EInterface.ex:
            activeInterface = <ExJudgeInterface />
            break
        case Enums.EInterface.info:
            activeInterface = <InfoView />
            break
        case Enums.EInterface.rank:
            activeInterface = <RankView />
            break
        case Enums.EInterface.variety:
            activeInterface = <VarietyView />
            break
        case Enums.EInterface.diffInspector:
            activeInterface = <DiffInspectorView />
            break
        case Enums.EInterface.exAiCombined:
            activeInterface = <ExAiCombinedView />
            break
        }

        return activeInterface
    }
}

class DefaultInterface extends React.Component {
    click(newInterface) {
        MainStore.activeInterface = newInterface
    }

    render() {
        let buttons = Interfaces.list.map((model) => {
            return model.type !== MainStore.activeInterface ?
                <button className="interfaceSelectButton" key={model.type} onClick={() => {this.click(model.type)}}>{model.name}</button> : undefined
        })
        return (
            <div className="defaultInterfaceContainer">
                {buttons}
            </div>
        )
    }
}

class AiJudgeInterface extends React.Component {
    constructor() {
        super()

        this.name = "Artistic Impression Judge"
        this.type = Enums.EInterface.head
    }

    render() {
        return <div>Artistic Impression Judge</div>
    }
}

class ExJudgeInterface extends React.Component {
    constructor() {
        super()

        this.name = "Execution Judge"
        this.type = Enums.EInterface.head
    }

    render() {
        return <div>Execution Judge</div>
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById("mount")
)
