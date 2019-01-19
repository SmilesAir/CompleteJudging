
const React = require("react")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./interfaceViewBase.less")

class InterfaceViewBase extends React.Component {
    constructor() {
        super()

        this.name = "Missing Interface Name"

        setTimeout(() => {
            this.init()
        }, 1)
    }

    init() {
        this.interface.fillWithResultsFunc = () => this.fillWithResults()
    }

    getTeamString() {
        return this.interface.getCurrentTeamString() || "No Team Set"
    }

    getJudgeHeaderElement() {
        let timeString = `${DataAction.getTimeString(this.interface.getRoutineTimeMs() || 0)} / ${DataAction.getTimeString(this.interface.obs.routineLengthSeconds * 1000)}`
        let headerString = `${this.name} - ${MainStore.userId} - ${this.interface.isEditing() ? "EDITING" : timeString} - ${this.getTeamString()}`
        return (
            <div className="judgeHeader">
                {headerString}
            </div>
        )
    }

    fillWithResults() {
        console.error(`${this.name} is missing override for fillWithResults`)
    }
}
module.exports = InterfaceViewBase
