"use strict"

const React = require("react")
const ReactDOM = require("react-dom")

require("./index.less")

class Main extends React.Component {
    render() {
        return <div className="mainContainer">Welcome to the Judging System</div>
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById("mount")
)
