"use strict"

const React = require("react")
const ReactDOM = require("react-dom")
const MobxReact = require("mobx-react")
require("favicon.ico")
var fpaLogo = require("images/fpa_logo.png")

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")
const InfoView = require("scripts/interfaces/infoView.js")
const Interfaces = require("scripts/interfaces/interfaces.js")

require("./index.less")

@MobxReact.observer class Main extends React.Component {
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
        

        return (
            <div className="mainContainer">
                <HeaderView />
                <InterfaceView/>
            </div>
        )
    }
}

class HeaderView extends React.Component {
    render() {
        return (
            <div className="headerContainer">Freestyle Players Association Judging System</div>
        )
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
            activeInterface = <DiffJudgeInterface />
            break
        case Enums.EInterface.ex:
            activeInterface = <ExJudgeInterface />
            break
        case Enums.EInterface.info:
            activeInterface = <InfoView />
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
                (<button className="interfaceSelectButton" key={model.type} onClick={() => {this.click(model.type)}}>{model.name}</button>)
                : undefined
        })
        return (
            <div className="defaultInterfaceContainer">
                {buttons}
            </div>
        )
    }
}

class HeadJudgeInterface extends React.Component {
    constructor() {
        super()

        this.name = "Head Judge"
        this.type = Enums.EInterface.head
    }

    render() {
        return <div>Head Judge</div>
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


class DiffJudgeInterface extends React.Component {
    constructor() {
        super()

        this.name = "Difficulty Judge"
        this.type = Enums.EInterface.head
    }

    render() {
        return <div>Difficulty Judge</div>
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
