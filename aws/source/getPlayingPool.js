
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = function(event, context, callback) {

    let tournamentName = event.queryStringParameters.tournamentName

    let getKeyDataParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: {"key": tournamentName}
    }
    docClient.get(getKeyDataParams).promise().then((response) => {
        console.log("response ", response)
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            let getPoolParams = {
                TableName: process.env.ACTIVE_POOLS,
                Key: {"key": response.Item.playingPoolKey}
            }
            console.log("get pool params", getPoolParams)
            return docClient.get(getPoolParams).promise()
        } else {
            console.log("can't find tour")
            throw new Error(`Error: Can't find tournament ${tournamentName}`)
        }
    }).then((response) => {
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            let successResponse = {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
                },
                body: JSON.stringify(response.Item.data)
            }

            console.log("success:", successResponse)
        
            callback(null, successResponse)
        } else {
            throw new Error(`Error: Can't find playing pool. ${tournamentName}`)
        }
    }).catch((error) => {
        console.log(error)

        let failResponse = {
            statusCode: error.status,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
            body: "Failed to get Playing Pool"
        }

        callback(failResponse)
    })
}

