
const MainStore = require("scripts/stores/mainStore.js")
const DataAction = require("scripts/actions/dataAction.js")

module.exports = class {
    constructor() {
        const DiffData = require("scripts/interfaces/fpa/data/diffData.js")
        const VarietyData = require("scripts/interfaces/fpa/data/varietyData.js")
        const ExAiCombinedData = require("scripts/interfaces/fpa/data/exAiCombinedData.js")

        this.dataModelList = [
            DiffData,
            VarietyData,
            ExAiCombinedData
        ]

        for (let dataModel of this.dataModelList) {
            if (!DataAction.verifyDataModel(dataModel)) {
                console.error("Failed to verify data model")
            } else {
                let constants = dataModel.getDefaultConstants()
                if (DataAction.verifyDataConstants(constants)) {
                    MainStore.constants[constants.name] = constants
                } else {
                    console.error("Missing required constants for data model")
                }
            }
        }
    }

    getModel(data) {
        for (let model of this.dataModelList) {
            if (model.verify(data)) {
                return model
            }
        }

        return undefined
    }

    getResultsSummary(results) {
        if (results !== undefined && results.length > 0) {
            let firstData = results[0].data
            for (let data of results) {
                if (!DataAction.isTeamListEqual(data.data.teamList, firstData.teamList)) {
                    console.error("Team list missmatch when generate results summary")
                    return undefined
                }
            }

            let ret = ""
            for (let i = 0; i < firstData.teamList.length; ++i) {
                let templateTeam = firstData.teamList[i]
                ret += `${DataAction.getTeamPlayers(templateTeam)} <> `

                let summaryList = []
                for (let data of results) {
                    let dataModel = this.getModel(data.data)
                    if (dataModel !== undefined) {
                        summaryList.push(dataModel.getSummary(data.data, i))
                    }
                }

                ret += summaryList.join(", ")

                ret += "\r\n"
            }

            return ret
        }

        return undefined
    }

    getResultsInspected(resultData, teamIndex) {
        let model = this.getModel(resultData.data)
        if (model !== undefined) {
            return model.getInspected(resultData, teamIndex)
        }

        return undefined
    }

    getResultsProcessed(data, teamIndex) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getProcessed !== undefined) {
                return model.getProcessed(data.teamScoreList[teamIndex])
            } else {
                console.error(`No getProcessed for ${model}`)
            }
        }

        return undefined
    }
}

