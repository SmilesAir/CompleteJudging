const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")

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
                    name: "General",
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
        this.onMouseMoveCallbackList = []
        this.onMouseUpCallbackList = []
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

    onMouseMove(event) {
        this.onMouseMoveCallbackList.forEach((callback) => {
            callback(event)
        })
    }

    onMouseUp(event) {
        this.onMouseUpCallbackList.forEach((callback) => {
            callback(event)
        })
    }

    getAiCounterElements() {
        let counterElements = []
        for (let counterKey in this.state.aiCounters) {
            let counter = this.state.aiCounters[counterKey]
            counterElements.push(
                <div key={counter.name} className="aiCounterContainer">
                    <button className="aiMinorIncrement" onClick={() => this.onMinorClick(counterKey)}>
                        <div>
                            {counter.name}
                        </div>
                        <div>
                            Minor ({counter.minorCount})
                        </div>
                    </button>
                    <button className="aiMajorIncrement" onClick={() => this.onMajorClick(counterKey)}>
                        <div>
                            {counter.name}
                        </div>
                        <div>
                            Major ({counter.majorCount})
                        </div>
                    </button>
                    <SuggestionSlider
                        name={counter.name}
                        minorCount={counter.minorCount}
                        onChanged={(value) => this.onMusicChanged(value)}
                        onMouseMoveCallbackList={this.onMouseMoveCallbackList}
                        onMouseUpCallbackList={this.onMouseUpCallbackList}
                    />
                </div>
            )
        }

        return counterElements
    }

    onMusicChanged(value) {
        console.log(value)
    }

    getAiElements() {
        return (
            <div className="aiContainer">
                {this.getAiCounterElements()}
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
            <div className="exAiCombinedContainer"
                onMouseMove={(event) => this.onMouseMove(event)}
                onMouseUp={() => this.onMouseUp()}
                onMouseLeave={() => this.onMouseUp()}>

                {this.getJudgeHeaderElement()}
                {this.getAiElements()}
                {this.getExElements()}
            </div>
        )
    }
}

class SuggestionSlider extends React.Component {
    constructor(props) {
        super(props)

        this.name = props.name
        this.state = {}
        this.state.value = 0

        props.onMouseMoveCallbackList.push((event) => this.onMouseMove(event))
        props.onMouseUpCallbackList.push(() => this.onMouseUp())

        this.state = {}
        this.state.dragging = false

        this.ref = React.createRef()
        this.scroll = 0
    }

    componentDidUpdate(prevProps) {
    }

    onMouseDown() {
        this.state.dragging = true
        this.setState(this.state)
    }

    onMouseMove(event) {
        if (this.state.dragging) {
            this.scroll -= event.movementY

            this.ref.current.scrollTop = this.scroll
        }
    }

    onMouseUp() {
        this.state.dragging = false
        this.setState(this.state)
    }

    render() {
        let slideList = []
        for (let i = -1; i <= 11; ++i) {
            let slideClassnames = "slide snap"
            let str = i >= 0 && i <= 10 ? i : ""
            slideList.push(
                <div key={i} className={slideClassnames}>
                    {str}
                </div>
            )
        }

        return (
            <div className="sliderContainer" onMouseDown={() => this.onMouseDown()}>
                <div className="innerSliderContainer" ref={this.ref}>
                    {slideList}
                </div>
            </div>
        )
    }
}
