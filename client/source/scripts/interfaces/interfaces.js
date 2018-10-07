

const InfoModel = require("scripts/interfaces/infoModel.js")
const InterfaceModels = require("scripts/interfaces/interfaceModels.js")


class Interfaces {
    constructor() {
        this.default = new InterfaceModels.DefaultModel()
        this.head = new InterfaceModels.HeadJudgeModel()
        this.ai = new InterfaceModels.AiJudgeModel()
        this.diff = new InterfaceModels.DiffJudgeModel()
        this.ex = new InterfaceModels.ExJudgeModel()
        this.info = new InfoModel()

        this.list = [
            this.default,
            this.head,
            this.ai,
            this.diff,
            this.ex,
            this.info,
        ]
    }
}
module.exports = new Interfaces()
