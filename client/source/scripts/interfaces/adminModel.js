
const Enums = require("scripts/stores/enumStore.js")
const InterfaceModelBase = require("scripts/interfaces/interfaceModelBase.js")

module.exports = class extends InterfaceModelBase {
    constructor() {
        super()

        this.name = "Admin Panel"
        this.type = Enums.EInterface.admin
    }

    createResultsData() {
        // unused
    }
}
