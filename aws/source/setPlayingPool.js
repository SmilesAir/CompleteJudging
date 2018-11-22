
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("./common.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {

    event.body = JSON.parse(event.body) || {}

    let newData = event.body.data
    let tournamentName = event.body.tournamentName

    let activePool = undefined
    try {
        activePool = await Common.getActivePool(tournamentName)
    } catch(error) {

    }

    console.log(activePool, newData)

    if (activePool !== undefined && activePool.poolHash === newData.poolHash) {
        if (activePool.observableHash !== newData.observableHash) {
            let tournamentKey = await Common.getTournamentKey(tournamentName)

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
    } else {
        let now = Date.now()
        let playingPoolKey = now.toString()
        await Common.updateTournamentKeyPlayingPool(tournamentName, playingPoolKey)

        let putPlayingPoolParams = {
            TableName : process.env.ACTIVE_POOLS,
            Item: {
                key: playingPoolKey,
                data: newData
            }
        }
        return docClient.put(putPlayingPoolParams).promise().catch((error) => {
            throw new Error(`Put new playing pool for ${tournamentName}`)
        })
    }
})}
