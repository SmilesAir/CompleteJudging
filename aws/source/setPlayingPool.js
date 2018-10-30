
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = function(event, context, callback) {

    event.body = JSON.parse(event.body) || {}

    let now = Date.now()
    let playingPoolKey = now.toString()
    let tournamentName = event.body.tournamentName

    let getParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: {"key": tournamentName}
    }
    docClient.get(getParams).promise().then((response) => {
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            response.Item.playingPoolKey = playingPoolKey
            return response.Item
        } else {
            throw Error(`Error. Can't find tournament with name: ${tournamentName}`)
        }
    }).then((newTournamentKeyItem) => {
        let putKeyItemParams = {
            TableName : process.env.ACTIVE_TOURNAMENT_KEYS,
            Item: newTournamentKeyItem
        }
        console.log("put key item", putKeyItemParams)
        docClient.put(putKeyItemParams).promise()

        let putPlayingPoolParams = {
            TableName : process.env.ACTIVE_POOLS,
            Item: {
                key: playingPoolKey,
                data: event.body.data
            }
        }
        console.log("put playing pool", putPlayingPoolParams)
        docClient.put(putPlayingPoolParams).promise()

        let successResponse = {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
            body: JSON.stringify({
                playingPoolKey: playingPoolKey
            })
        }

        callback(null, successResponse)
    }).catch((error) => {
        console.log(error)

        let failResponse = {
            statusCode: error.status,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
            body: "Failed to set Playing Pool"
        }

        callback(failResponse)
    })
}
