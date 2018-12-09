

const React = require("react")
const Enums = require("scripts/stores/enumStore.js")
const MainStore = require("scripts/stores/mainStore.js")

class InterfaceModelBase extends React.Component {
    constructor() {
        super()

        this.name = "Missing Interface Name"
        this.type = Enums.EInterface.invalid
        this.updateIntervalMs = 5000
    }

    init() {
        if (this.obs !== undefined) {
            this.setObs(this.obs)
        }
    }

    setObs(obs) {
        MainStore.interfaceObs = obs
    }
}
module.exports = InterfaceModelBase
