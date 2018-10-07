
const ModelInterfaceBase = require("scripts/interfaces/interfaceModelBase.js")
const Enums = require("scripts/stores/enumStore.js")

module.exports.DefaultModel = class extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Welcome"
        this.type = Enums.EInterface.default
    }
}

class HeadJudgeModel extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Head Judge"
        this.type = Enums.EInterface.head
    }
}
module.exports.HeadJudgeModel = HeadJudgeModel

class AiJudgeModel extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Artistic Impression Judge"
        this.type = Enums.EInterface.ai
    }
}
module.exports.AiJudgeModel = AiJudgeModel

class DiffJudgeModel extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Difficulty Judge"
        this.type = Enums.EInterface.diff
    }
}
module.exports.DiffJudgeModel = DiffJudgeModel

class ExJudgeModel extends ModelInterfaceBase {
    constructor() {
        super()

        this.name = "Execution Judge"
        this.type = Enums.EInterface.ex
    }
}
module.exports.ExJudgeModel = ExJudgeModel
