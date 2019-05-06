
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("complete-judging-common/source/backendCommon.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {

    event.body = JSON.parse(event.body) || {}

    let tournamentName = event.pathParameters.tournamentName

    let activePool = undefined
    try {
        activePool = await Common.getActivePool(tournamentName)
    } catch(error) {
        console.log(`No active pool currenty set. ${tournamentName}`)
    }

    let tournamentKey = await Common.getTournamentKey(tournamentName)

    // Probably don't even need to query activePool, just update the sub object state inside data
    if (activePool !== undefined) {

        let newState = activePool.state || {}
        newState[event.body.judgeId] = {
            status: event.body.status
        }
        let newData = activePool
        newData.state = newState

        let updateParams = {
            TableName : process.env.ACTIVE_POOLS,
            Key: {
                key: tournamentKey.playingPoolKey
            },
            UpdateExpression: "set #data = :data",
            ExpressionAttributeNames: {
                "#data": "data"
            },
            ExpressionAttributeValues: {
                ":data": newData
            }
        }

        return docClient.update(updateParams).promise().catch((error) => {
            throw new Error(`Update observable data for ${tournamentName}. ${error}`)
        })
    }
})}


