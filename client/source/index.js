"use strict"

const React = require("react")
const ReactDOM = require("react-dom")

// import

class Main extends React.Component {
    render() {
        return <div>Welcome to the Judging System</div>
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById("mount")
)
