
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

        this.getConstantsFromCloud()
    }

    async getConstantsFromCloud() {
        await fetch("https://s3-us-west-2.amazonaws.com/completejudging-constants/base-constants.json", {
            method: "GET",
            headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            for (let key in response) {
                MainStore.constants[key] = Object.assign(MainStore.constants[key], response[key])
            }
        }).catch(() => {
            console.error("Can't query constants from s3")
        })
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

    getFullResultsProcessed(data, teamIndex, preProcessedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getFullProcessed !== undefined) {
                return model.getFullProcessed(data.teamScoreList[teamIndex], preProcessedData)
            } else {
                console.error(`No getFullProcessed for ${model}`)
            }
        }

        return undefined
    }

    getIncrementalScoreboardResultsProcessed(data, teamIndex, preProcessedData, processedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getIncrementalScoreboardProcessed !== undefined) {
                return model.getIncrementalScoreboardProcessed(data.teamScoreList[teamIndex], preProcessedData, processedData)
            } else {
                console.error(`No getIncrementalScoreboardProcessed for ${model}`)
            }
        }

        return undefined
    }

    getScoreboardResultsProcessed(data, teamIndex, preProcessedData, processedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getScoreboardProcessed !== undefined) {
                return model.getScoreboardProcessed(data.teamScoreList[teamIndex], preProcessedData, processedData)
            } else {
                console.error(`No getScoreboardProcessed for ${model}`)
            }
        }

        return undefined
    }

    getDiffDetailedResultsProcessed(data, teamIndex, preProcessedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getDiffDetailedProcessed !== undefined) {
                return model.getDiffDetailedProcessed(data.teamScoreList[teamIndex], preProcessedData)
            }
        }

        return undefined
    }

    getExAiCombinedDetailedResultsProcessed(data, teamIndex, preProcessedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getExAiCombinedDetailedProcessed !== undefined) {
                return model.getExAiCombinedDetailedProcessed(data.teamScoreList[teamIndex], preProcessedData)
            }
        }

        return undefined
    }

    preProcessedData(data, teamIndex, preProcessedData) {
        let model = this.getModel(data)
        if (model !== undefined) {
            if (model.getPreProcessed !== undefined) {
                return model.getPreProcessed(data.teamScoreList[teamIndex], preProcessedData)
            }
        }

        return undefined
    }
}

