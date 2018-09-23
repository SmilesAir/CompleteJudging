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
                {activeInterface}
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
