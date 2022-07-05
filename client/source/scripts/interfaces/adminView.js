
const React = require("react")
const MobxReact = require("mobx-react")

const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const CommonAction = require("scripts/actions/commonAction.js")

require("./adminView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor(props) {
        super(props)
    }

    saveFile(filename, text) {
        let element = document.createElement("a")
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
        element.setAttribute("download", filename)

        element.style.display = "none"
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)
    }

    exportAndDownloadAllData(isProd) {
        fetch("https://xvbh62vfdj.execute-api.us-west-2.amazonaws.com/development/getExportedData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json()).then((response) => {
            console.log(response)
            this.saveFile("AllFrisbeeData.json", JSON.stringify(response.data))
        }).catch((error) => {
            console.error("getExportedData error: " + error)
        })
    }

    render() {
        return (
            <div className="adminContainer">
                <h1>
                    Admin Panel
                </h1>
                <div className="export">
                    <h2>
                        Export and Download All Data
                    </h2>
                    <div>
                        <button onClick={() => this.exportAndDownloadAllData(false)}>Development</button>
                        <button onClick={() => this.exportAndDownloadAllData(true)}>Production</button>
                    </div>
                </div>
            </div>
        )
    }
}
