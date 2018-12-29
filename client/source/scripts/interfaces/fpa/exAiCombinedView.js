const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const NumberLinePickerView = require("scripts/views/numberLinePickerView.js")

require("./exAiCombinedView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor() {
        super()

        this.name = "Ex/Ai Judge"
        this.interface = Interfaces.exAiCombined
        this.state = {
            aiCounters: {
                music: {
                    name: "Music",
                    minorCount: 0,
                    majorCount: 0
                },
                teamwork: {
                    name: "Teamwork",
                    minorCount: 0,
                    majorCount: 0
                },
                general: {
                    name: "General Impression",
                    minorCount: 0,
                    majorCount: 0
                }
            },
            pointDeductions: {
                "1": 0,
                "2": 0,
                "3": 0,
                "5": 0
            }
        }
    }

    onInputEnd(number) {
        this.interface.setQualityScore(number)

        this.state.qualityScore = number
        this.setState(this.state)
    }

    onMinorClick(counterKey) {
        this.state.aiCounters[counterKey].minorCount = this.interface.incrementMinor(counterKey)

        this.setState(this.state)
    }

    onMajorClick(counterKey) {
        this.state.aiCounters[counterKey].majorCount = this.interface.incrementMajor(counterKey)

        this.setState(this.state)
    }

    onAddClick(point) {
        let newCount = this.interface.incrementDeduction(point)
        this.state.pointDeductions[point] = newCount
        this.setState(this.state)
    }

    onRemoveClick(point) {
        let newCount = this.interface.decrementDeduction(point)
        this.state.pointDeductions[point] = newCount
        this.setState(this.state)
    }

    getAiCounterElements() {
        let counterElements = []
        for (let counterKey in this.state.aiCounters) {
            let counter = this.state.aiCounters[counterKey]
            counterElements.push(
                <div key={counter.name} className="aiCounterContainer">
                    <button className="aiMinorIncrement" onClick={() => this.onMinorClick(counterKey)}>{counter.name} Minor ({counter.minorCount})</button>
                    <button className="aiMajorIncrement" onClick={() => this.onMajorClick(counterKey)}>{counter.name} Major ({counter.majorCount})</button>
                </div>
            )
        }

        return (
            <div className="aiContainer">
                {counterElements}
            </div>
        )
    }

    getExElements() {
        let pointDeductions = [ 1, 2, 3, 5 ]
        let exElements = pointDeductions.map((point) => {
            let pointName = `.${point}`
            return (
                <div key={point} className="exElementContainer">
                    <button className="removeButton" onClick={() => this.onRemoveClick(point)}>Remove {pointName}</button>
                    <button className="addButton" onClick={() => this.onAddClick(point)}>Add {pointName}</button>
                    <div className="countText">{this.state.pointDeductions[point]}</div>
                </div>
            )
        })

        return (
            <div className="exContainer">
                {exElements}
            </div>
        )
    }

    render() {
        if (this.interface.obs.playingPool === undefined || this.interface.obs.results === undefined) {
            return <div className="exAiCombinedContainer">Waiting for Head Judge</div>
        }

        return (
            <div className="exAiCombinedContainer">
                {this.getJudgeHeaderElement()}
                {this.getAiCounterElements()}
                {this.getExElements()}
            </div>
        )
    }
}
