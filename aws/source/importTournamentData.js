
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("complete-judging-common/source/backendCommon.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    event.body = JSON.parse(event.body) || {}
    let data = event.body

    let tournamentName = event.pathParameters.tournamentName

    let tournamentKey = await Common.getTournamentKey(tournamentName)
    tournamentKey = Object.assign(tournamentKey, data.tournamentKey)

    let putTournamentKeyParams = {
        TableName : process.env.ACTIVE_TOURNAMENT_KEYS,
        Item: tournamentKey
    }
    await docClient.put(putTournamentKeyParams).promise().catch((error) => {
        throw new Error(`Put tournament key. ${error}`)
    })


    let writePoolList = []
    for (let pool in data.poolMap) {
        writePoolList.push({
            PutRequest: {
                Item: data.poolMap[pool]
            }
        })
    }

    let writeResultsList = []
    for (let judgeName in data.resultsMap) {
        let judgeData = data.resultsMap[judgeName]
        for (let time in judgeData) {
            writeResultsList.push({
                PutRequest: {
                    Item: judgeData[time]
                }
            })
        }
    }

    let batchWriteParams = {
        RequestItems: {
            [process.env.TOURNAMENT_INFO]: [
                {
                    PutRequest: {
                        Item: data.tournamentInfo
                    }
                }
            ],
            [process.env.ACTIVE_POOLS]: writePoolList.length > 0 ? writePoolList : undefined,
            [process.env.ACTIVE_RESULTS]: writeResultsList.length > 0 ? writeResultsList : undefined
        }
    }

    docClient.batchWrite(batchWriteParams).promise().catch((error) => {
        throw new Error(`Write tournament data. ${error}`)
    })
})}

