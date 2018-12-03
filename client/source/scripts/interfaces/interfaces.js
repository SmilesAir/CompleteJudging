

const MainStore = require("scripts/stores/mainStore.js")
const InfoModel = require("scripts/interfaces/infoModel.js")
const HeadModel = require("scripts/interfaces/simpleRank/headModel.js")
const RankModel = require("scripts/interfaces/simpleRank/judgeModel.js")
const DiffModel = require("scripts/interfaces/fpa/diffModel.js")
const VarietyModel = require("scripts/interfaces/fpa/varietyModel.js")
const InterfaceModels = require("scripts/interfaces/interfaceModels.js")


class Interfaces {
    constructor() {
        this.default = new InterfaceModels.DefaultModel()
        this.head = new HeadModel()
        this.ai = new InterfaceModels.AiJudgeModel()
        this.diff = new DiffModel()
        this.ex = new InterfaceModels.ExJudgeModel()
        this.info = new InfoModel()
        this.rank = new RankModel()
        this.variety = new VarietyModel()

        this.list = [
            this.default,
            this.head,
            this.ai,
            this.diff,
            this.ex,
            this.info,
            this.rank,
            this.variety
        ]
    }

    init() {

        this.info.init()

        this.activeInterface = this.list[MainStore.activeInterface]
        if (this.activeInterface) {
            if (this.activeInterface.init !== undefined) {
                this.activeInterface.init()
            }
        }
    }
}
module.exports = new Interfaces()
