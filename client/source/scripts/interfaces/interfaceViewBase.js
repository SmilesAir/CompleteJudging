
const React = require("react")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./interfaceViewBase.less")

class InterfaceViewBase extends React.Component {
    constructor() {
        super()

        this.name = "Missing Interface Name"
    }

    getJudgeHeaderElement() {
        let timeString = `${DataAction.getTimeString(this.interface.getRoutineTimeMs() || 0)} / ${DataAction.getTimeString(this.interface.obs.routineLengthSeconds * 1000)}`
        let headerString = `${this.name} - ${MainStore.userId} - ${timeString}`
        return (
            <div className="judgeHeader">
                {headerString}
            </div>
        )
    }
}
module.exports = InterfaceViewBase
