
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("./common.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {

    event.body = JSON.parse(event.body) || {}

    let now = Date.now()
    let playingPoolKey = now.toString()
    let tournamentName = event.body.tournamentName

    await Common.updateTournamentKeyPlayingPool(tournamentName, playingPoolKey)

    let putPlayingPoolParams = {
        TableName : process.env.ACTIVE_POOLS,
        Item: {
            key: playingPoolKey,
            data: event.body.data
        }
    }
    return docClient.put(putPlayingPoolParams).promise().catch((error) => {
        throw new Error(`Error. Put new playing pool for ${tournamentName}`)
    })
})}
