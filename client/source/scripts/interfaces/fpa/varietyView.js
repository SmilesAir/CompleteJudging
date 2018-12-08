const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const NumberLinePickerView = require("scripts/views/numberLinePickerView.js")

require("./varietyView.less")

module.exports = @MobxReact.observer class extends ModelInterfaceBase {
    constructor() {
        super()

        this.state = {
            moveCount: 0
        }
    }

    onInputEnd(number) {
        Interfaces.variety.setQualityScore(number)

        this.state.qualityScore = number
        this.setState(this.state)
    }

    onKeyDown(event) {
        this.incrementEvent(event)
    }

    onIncrementButtonKeyDown(event) {
        event.stopPropagation()
        event.preventDefault()

        this.incrementEvent(event)
    }

    onDecrementButtonKeyDown(event) {
        event.stopPropagation()
        event.preventDefault()
    }

    incrementEvent(event) {
        if (event.key === " ") {
            this.incrementMoveCount()
        }
    }

    incrementMoveCount() {
        ++this.state.moveCount
        this.setState(this.state)


        Interfaces.variety.setQuantityScore(this.state.moveCount)
    }

    decrementMoveCount() {
        this.state.moveCount = Math.max(0, this.state.moveCount - 1)
        this.setState(this.state)

        Interfaces.variety.setQuantityScore(this.state.moveCount)
    }

    render() {
        if (Interfaces.variety.obs.playingPool === undefined) {
            return <div className="varietyContainer">Waiting for Head Judge</div>
        }

        let headerText = `Variety Judge - ${MainStore.userId}`

        return (
            <div className="varietyContainer" tabIndex="0" onKeyDown={(event) => this.onKeyDown(event)}>
                <div className="header">
                    {headerText}
                </div>
                <div className="scoresContainer">
                    <div>Unique Move Count: {this.state.moveCount}</div>
                    <div>Quality Score: {this.state.qualityScore}</div>
                </div>
                <div className="quantityContainer">
                    <button className="quantityButton" onClick={() => this.incrementMoveCount()} onKeyDown={(event) => this.onIncrementButtonKeyDown(event)}>Increment</button>
                    <button className="quantityButton" onClick={() => this.decrementMoveCount()} onKeyDown={(event) => this.onDecrementButtonKeyDown(event)}>Decrement</button>
                </div>
                <NumberLinePickerView onInputEnd={(event) => this.onInputEnd(event)}/>
            </div>
        )
    }
}
