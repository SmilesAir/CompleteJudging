

const InfoModel = require("scripts/interfaces/infoModel.js")
const HeadModel = require("scripts/interfaces/simpleRank/headModel.js")
const RankModel = require("scripts/interfaces/simpleRank/judgeModel.js")
const DiffModel = require("scripts/interfaces/fpa/diffModel.js")
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

        this.list = [
            this.default,
            this.head,
            this.ai,
            this.diff,
            this.ex,
            this.info,
            this.rank
        ]
    }

    init() {
        this.info.init()
        this.rank.init()
        this.diff.init()
    }
}
module.exports = new Interfaces()
