
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async function(event, context, callback, func) {
    try {
        let result = await func(event, context)

        let successResponse = {
            statusCode: 200,
            headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
            body: JSON.stringify(result)
        }

        callback(null, successResponse)
    } catch (error) {
        console.log(`Handler Catch: ${error}`)

        let failResponse = {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
            body: error
        }

        callback(failResponse)
    }
    
}

module.exports.isItemEmpty = function(item) {
    return Object.keys(item).length === 0 && item.constructor === Object
}

module.exports.getTournamentKey = function(tournamentName) {
    let getParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: {"key": tournamentName}
    }
    return docClient.get(getParams).promise().then((response) => {
        if (!module.exports.isItemEmpty(response)) {
            return response.Item
        } else {
            throw new Error(`Error. Can't find tournament with name: ${tournamentName}`)
        }
    }).catch((error) => {
        throw new Error(`Error. Can't find tournament with name: ${tournamentName}`)
    })
}

module.exports.getActivePool = async function(tournamentName) {
    let tournamentKey = await module.exports.getTournamentKey(tournamentName)
    if (tournamentKey.playingPoolKey !== undefined) {
        let getPoolParams = {
            TableName: process.env.ACTIVE_POOLS,
            Key: {"key": tournamentKey.playingPoolKey}
        }
        let getResp = await docClient.get(getPoolParams).promise()
        if (!module.exports.isItemEmpty(getResp)) {
            return getResp.Item.data
        } else {
            throw new Error(`Error. No active pool data for ${tournamentName}`)
        }
    } else {
        throw new Error(`Error. ${tournamentName} doesn't have a playing pool`)
    }
}

module.exports.updateActivePoolAttribute = async function(tournamentName, attributeName, attributeValue) {
    let tournamentKey = await module.exports.getTournamentKey(tournamentName)
    if (tournamentKey.playingPoolKey !== undefined) {
        let updatePoolParams = {
            TableName: process.env.ACTIVE_POOLS,
            Key: { "key": tournamentKey.playingPoolKey },
            UpdateExpression: `set ${attributeName} = :value`,
            ExpressionAttributeValues: { ":value": attributeValue }
        }
        return docClient.update(updatePoolParams).promise().catch((error) => {
            throw new Error(`Error. Update active pool for ${tournamentName}. ${error}`)
        })
    } else {
        throw new Error(`Error. ${tournamentName} doesn't have a playing pool`)
    }
}

module.exports.updateTournamentKeyPlayingPool = async function(tournamentName, playingPoolKey) {
    let tournamentKey = await module.exports.getTournamentKey(tournamentName)

    let updatePoolParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: { "key": tournamentName },
        UpdateExpression: `set playingPoolKey = :playingPoolKey`,
        ExpressionAttributeValues: { ":playingPoolKey": playingPoolKey }
    }
    return docClient.update(updatePoolParams).promise().catch((error) => {
        throw new Error(`Error. Update active pool for ${tournamentName}. ${error}`)
    })
}
