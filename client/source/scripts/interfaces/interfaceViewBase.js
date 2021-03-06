
const React = require("react")
const DataStore = require("scripts/stores/dataStore.js")
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")
const LocStore = require("scripts/stores/locStore.js")

require("./interfaceViewBase.less")

class InterfaceViewBase extends React.Component {
    constructor() {
        super()

        this.name = LocStore.MissingInterfaceName

        setTimeout(() => {
            this.init()
        }, 1)
    }

    init() {
        if (this.interface !== undefined) {
            this.interface.fillWithResultsFunc = () => this.fillWithResults()
        }
    }

    getTeamString() {
        return this.interface.getCurrentTeamString() || LocStore.NoTeamSet
    }

    getJudgeHeaderElement() {
        let timeString = `${DataAction.getTimeString(this.interface.getRoutineTimeMs() || 0)} / ${DataAction.getTimeString(this.interface.obs.routineLengthSeconds * 1000)}`
        let headerString = ` ${this.name} - ${MainStore.userId} - ${this.interface.isEditing() ? LocStore.EDITING : timeString} - ${this.getTeamString()}`
        let scoreString = DataStore.dataModel.getHeaderSummary(this.interface.obs.results, this.interface.getActiveTeamIndex()) || `[${LocStore.Missing}]`
        return (
            <div className="judgeHeader">
                <div className="scoreString">
                    {scoreString}
                </div>
                <div>
                    {headerString}
                </div>
            </div>
        )
    }

    fillWithResults() {
        console.error(`${this.name} ${LocStore.MissingFillWithResults}`)
    }
}
module.exports = InterfaceViewBase
