
const React = require("react")
const MobxReact = require("mobx-react")
const { JsonEditor } = require("jsoneditor-react")

const MainStore = require("scripts/stores/mainStore.js")
const InterfaceViewBase = require("scripts/interfaces/interfaceViewBase.js")
const CommonAction = require("scripts/actions/commonAction.js")

require("./constantsEditorView.less")

module.exports = @MobxReact.observer class extends InterfaceViewBase {
    constructor(props) {
        super(props)

        let idParam = MainStore.url.searchParams.get("constantsId")

        this.state = {
            json: undefined,
            constantsId: idParam || "default",
            constantsIdList: undefined
        }

        setTimeout(() => {
            this.state.json = MainStore.constants
            this.setState(this.state)
        }, 500)
    }

    onUpload() {
        CommonAction.fetchEx("UPLOAD_CONSTANTS", {
            constantsId: this.state.constantsId
        }, undefined, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                constants: this.state.json
            })
        }).catch((error) => {
            console.log("Error: Upload and Save", error)
        })
    }

    onGetIdList() {
        CommonAction.fetchEx("GET_CONSTANTS_LIST", undefined, undefined, {
            method: "GET"
        }).then((response) => {
            return response.json()
        }).then((response) => {
            this.state.constantsIdList = response.constantsIdList
            this.setState(this.state)
        }).catch((error) => {
            console.error("Error: Can't query constants", error)
        })
    }

    onConstantsIdChanged(e) {
        this.state.constantsId = e.target.value
        this.setState(this.state)
    }

    onJsonChanged(updatedContent) {
        this.state.json = updatedContent
    }

    onLoad(id) {
        let oldConstantsId = MainStore.url.searchParams.get("constantsId")
        if (oldConstantsId === undefined) {
            location.href += `&constantsId=${id}`
        } else {
            console.log(oldConstantsId, id)
            location.href = location.href.replace(`constantsId=${oldConstantsId}`, `constantsId=${id}`)
        }
    }

    getIdListElement() {
        if (this.state.constantsIdList === undefined) {
            return <button onClick={() => this.onGetIdList()}>Get Constants Names</button>
        } else {
            let rows = []
            for (let id of this.state.constantsIdList) {
                rows.push(
                    <div key={id}>
                        {id}
                        <button onClick={() => this.onLoad(id)}>Load</button>
                    </div>)
            }

            return rows
        }
    }

    render() {
        if (this.state.json === undefined) {
            return null
        }

        return (
            <div className="constantsEditorContainer">
                <h1>
                    Constants Editor
                </h1>
                { this.getIdListElement() }
                <div>
                    Save Name:
                    <input value={this.state.constantsId} onChange={(e) => this.onConstantsIdChanged(e)} />
                </div>
                <button onClick={() => this.onUpload()}>Save and Upload</button>
                <JsonEditor value={this.state.json} onChange={(a, b, c) => this.onJsonChanged(a, b, c)} />
                <button onClick={() => this.onUpload()}>Save and Upload</button>
            </div>
        )
    }
}
