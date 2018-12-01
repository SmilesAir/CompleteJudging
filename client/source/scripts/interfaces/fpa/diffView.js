const React = require("react")
const MobxReact = require("mobx-react")

const MainStore = require("scripts/stores/mainStore.js")
const Enums = require("scripts/stores/enumStore.js")
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const Interfaces = require("scripts/interfaces/interfaces.js")
const DataAction = require("scripts/actions/dataAction.js")

require("./diffView.less")

module.exports = @MobxReact.observer class extends ModelInterfaceBase {
    constructor() {
        super()

        this.startTime = undefined
        this.state = {}
        this.touchAreaRef = React.createRef()
    }

    getTeams() {
        let i = 0
        return Interfaces.rank.obs.playingPool.teamList.map((team) => {
            return <TeamView team={team} teamIndex={i} key={i++}/>
        })
    }

    getNumbers() {
        let numberList = []
        for (let i = 0; i <= 10; ++i) {
            numberList.push(
                <div key={i} className="number">
                    {i}
                </div>
            )
        }

        return numberList
    }

    getStateNumberOut() {
        return this.state.numberOut !== undefined ? Math.round(this.state.numberOut * 2) / 2 : undefined
    }

    getNumberOutView() {
        if (this.getStateNumberOut() !== undefined) {
            let popupClassnames = `popupContainer ${Interfaces.diff.obs.editIndex === undefined ? "" : "editing"}`

            return (
                <div className="overlay">
                    <div className={popupClassnames}>
                        <div className="numberOut">
                            {this.getStateNumberOut()}
                        </div>
                    </div>
                </div>
            )
        } else {
            return undefined
        }
    }

    updateNumberOut(posX) {
        let parent = this.touchAreaRef.current
        let inputX = Math.max(0, Math.min(1, (posX - parent.offsetLeft * 1.15) / (parent.offsetWidth * .92)))

        this.state.numberOut = inputX * 10
        this.setState(this.state)
    }

    onTouchStart(event) {
        this.updateNumberOut(event.targetTouches[0].clientX)
    }

    onTouchMove(event) {
        this.updateNumberOut(event.targetTouches[0].clientX)
    }

    onTouchEnd(event) {
        this.onParentInputEnd(event)
    }

    onMouseDown(event) {
        this.updateNumberOut(event.clientX)
    }

    onMouseMove(event) {
        if (event.buttons === 1 || Interfaces.diff.obs.editIndex !== undefined) {
            this.updateNumberOut(event.clientX)
        }
    }

    onMouseUp(event) {
        this.onParentInputEnd(event)
    }

    onParentTouchMove(event) {
        if (Interfaces.diff.obs.editIndex !== undefined) {
            let inputContainer = document.getElementsByClassName("inputContainer")[0]
            let bounds = inputContainer.getBoundingClientRect()

            let x = event.targetTouches[0].clientX
            let y = event.targetTouches[0].clientY

            if (x >= bounds.left &&
                x <= bounds.right &&
                y >= bounds.top &&
                y <= bounds.bottom) {
                
                this.updateNumberOut(x)
            }
        }
    }

    onParentInputEnd(event) {
        event.preventDefault()
        event.stopPropagation()
        
        if (Interfaces.diff.obs.editIndex === undefined) {
            let score = this.getStateNumberOut()
            if (score !== undefined) {
                Interfaces.diff.addScore(score)
            }
        } else {
            Interfaces.diff.endEdit(this.getStateNumberOut())
        }

        this.state.numberOut = undefined
        this.setState(this.state)
    }

    render() {
        if (Interfaces.diff.obs.playingPool === undefined) {
            return <div className="topContainer">Waiting for Head Judge</div>
        }

        let headerText = `Difficulty Judge - ${MainStore.userId}`

        return (
            <div className="topContainer"
                onMouseUp={(event) => this.onParentInputEnd(event)}
                onTouchMove={(event) => this.onParentTouchMove(event)}
                onTouchEnd={(event) => this.onParentInputEnd(event)}>
                <div className="header">
                    {headerText}
                </div>
                <TimeMarksView />
                <div id="inputContainer" className="inputContainer"
                    onTouchStart={(event) => this.onTouchStart(event)}
                    onTouchMove={(event) => this.onTouchMove(event)}
                    onTouchEnd={(event) => this.onTouchEnd(event)}
                    onMouseDown={(event) => this.onMouseDown(event)}
                    onMouseMove={(event) => this.onMouseMove(event)}
                    onMouseUp={(event) => this.onMouseUp(event)}
                    onMouseLeave={(event) => this.onMouseUp(event)}>
                    <div className="touchArea" ref={this.touchAreaRef}>
                        {this.getNumbers()}
                    </div>
                </div>
                {this.getNumberOutView()}
            </div>
        )
    }
}

@MobxReact.observer class MarkView extends React.Component {
    constructor(props) {
        super(props)

        this.markIndex = props.markIndex
    }

    onTouchStart(event) {
        this.onEditStart()
    }

    onMouseDown(event,) {
        this.onEditStart()
    }

    onEditStart() {
        Interfaces.diff.startEdit(this.markIndex)
    }

    render() {
        let score = Interfaces.diff.obs.results.teamScoreList[Interfaces.diff.obs.playingTeamIndex].scores[this.markIndex]

        return (
            <div className="markContainer"
                onTouchStart={(event) => this.onTouchStart(event)}
                onMouseDown={(event) => this.onMouseDown(event)}>
                {score}
            </div>
        )
    }
}

@MobxReact.observer class TimeMarksView extends React.Component {
    constructor() {
        super()

        this.marksPerGroup = 5
    }

    getGroupViews() {
        if (Interfaces.diff.obs.results === undefined) {
            return undefined
        }

        let teamScores = Interfaces.diff.obs.results.teamScoreList[Interfaces.diff.obs.playingTeamIndex]
        if (teamScores === undefined) {
            return undefined
        }

        let diffScoreList = teamScores.scores

        let markCount = diffScoreList.length
        let groupCount = Math.ceil(markCount / this.marksPerGroup)

        let ret = []
        for (let groupIndex = 0; groupIndex < groupCount; ++groupIndex) {

            let markList = []
            let markOffset = groupIndex * this.marksPerGroup
            let groupMarkCount = Math.min(this.marksPerGroup, markCount - markOffset)
            for (let i = 0; i < groupMarkCount; ++i) {
                let markIndex = i + markOffset
                markList.push(<MarkView key={markIndex} markIndex={markIndex} />)
            }

            ret.push(
                <div key={groupIndex} className="groupContainer">
                    {markList}
                </div>
            )
        }

        return ret
    }

    render() {
        return (
            <div className="timeMarksContainer">
                {this.getGroupViews()}
            </div>
        )
    }
}