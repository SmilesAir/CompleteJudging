
const React = require("react")
const MainStore = require("scripts/stores/mainStore.js")

require("./interfaceViewBase.less")

class InterfaceViewBase extends React.Component {
    constructor() {
        super()

        this.name = "Missing Interface Name"
    }

    getJudgeHeaderElement() {
        let headerString = `${this.name} - ${MainStore.userId}`
        return (
            <div className="judgeHeader">
                {headerString}
            </div>
        )
    }
}
module.exports = InterfaceViewBase
