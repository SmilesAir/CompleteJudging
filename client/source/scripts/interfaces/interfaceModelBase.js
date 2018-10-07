

const React = require("react")
const Enums = require("scripts/stores/enumStore.js")

class ModelInterfaceBase extends React.Component {
    constructor() {
        super()

        this.name = "Missing Interface Name"
        this.type = Enums.EInterface.invalid
    }
}
module.exports = ModelInterfaceBase
