
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("complete-judging-common/source/backendCommon.js")


module.exports.getTournamentInfo = function(key) {
    let getParams = {
        TableName: process.env.TOURNAMENT_INFO,
        Key: {
            key: key
        }
    }
    return docClient.get(getParams).promise().then((response) => {
        return response.Item
    }).catch((error) => {
        console.log("Get Tournament Info Error", error)

        return undefined
    })
}

module.exports.getTournamentKey = function(tournamentName) {
    let getParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: {"key": tournamentName}
    }
    return docClient.get(getParams).promise().then((response) => {
        if (!Common.isItemEmpty(response)) {
            return response.Item
        } else {
            throw new Error(`Can't find tournament with name: ${tournamentName}`)
        }
    }).catch((error) => {
        throw new Error(`Can't find tournament with name: ${tournamentName}`)
    })
}

module.exports.getPoolItem = async function(poolKey) {
    let getParams = {
        TableName: process.env.ACTIVE_POOLS,
        Key: {"key": poolKey}
    }
    let getResp = await docClient.get(getParams).promise()
    if (!Common.isItemEmpty(getResp)) {
        return getResp.Item
    } else {
        throw new Error(`No active pool data for ${tournamentName}`)
    }
}

module.exports.getResultItem = function(resultsKey) {
    let getParams = {
        TableName : process.env.ACTIVE_RESULTS,
        Key: resultsKey
    }
    return docClient.get(getParams).promise().then((response) => {
        return response.Item
    }).catch((error) => {
        throw new Error(`Get from active results. ${error}`)
    })
}

module.exports.updateActivePoolAttribute = async function(tournamentName, attributeName, attributeValue) {
    let tournamentKey = await module.exports.getTournamentKey(tournamentName)
    if (tournamentKey.playingPoolKey !== undefined) {
        let updatePoolParams = {
            TableName: process.env.ACTIVE_POOLS,
            Key: { "key": tournamentKey.playingPoolKey },
            UpdateExpression: "set #attributeName = :value",
            ExpressionAttributeNames: { "#attributeName": attributeName },
            ExpressionAttributeValues: { ":value": attributeValue }
        }
        return docClient.update(updatePoolParams).promise().catch((error) => {
            throw new Error(`Update active pool for ${tournamentName}. ${error}`)
        })
    } else {
        throw new Error(`${tournamentName} doesn't have a playing pool`)
    }
}

module.exports.updateTournamentKeyWithObject = async function(tournamentName, newObject) {
    let expresssions = []
    let names = {}
    let values = {}
    for (let key in newObject) {
        let safeKey = key.replace(/-/g, '_')
        let attrName = `#${safeKey} = :${safeKey}`
        expresssions.push(attrName)
        names[`#${safeKey}`] = key
        values[`:${safeKey}`] = newObject[key]
    }

    const updateExp = "set " + expresssions.join(", ")
    let updatePoolParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: { "key": tournamentName },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
    }
    return docClient.update(updatePoolParams).promise().catch((error) => {
        throw new Error(`Update active pool for ${tournamentName}. ${error}`)
    })
}

module.exports.updateTournamentKeyPlayingPool = async function(tournamentName, playingPoolKey) {
    let updatePoolParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: { "key": tournamentName },
        UpdateExpression: `set playingPoolKey = :playingPoolKey`,
        ExpressionAttributeValues: { ":playingPoolKey": playingPoolKey }
    }
    return docClient.update(updatePoolParams).promise().catch((error) => {
        throw new Error(`Update active pool for ${tournamentName}. ${error}`)
    })
}

module.exports.getResultsHistory = function(judgeName, startTime) {
    let queryStartTime = startTime === 0 ? Date.now() : startTime - 1
    let params = {
        TableName: process.env.ACTIVE_RESULTS,
        ProjectionExpression: "judgeName, #time, #data",
        KeyConditionExpression: "judgeName = :judgeName and #time between :startTime and :endTime",
        ExpressionAttributeNames: {
            "#time": "time",
            "#data": "data"
        },
        ExpressionAttributeValues: {
            ":judgeName": judgeName,
            ":startTime": queryStartTime - 60 * 60 * 1000,
            ":endTime": queryStartTime
        }
    }

    return docClient.query(params).promise().then((response) => {
        return response
    }).catch((error) => {
        throw new Error(`${tournamentName}. Can't query backup results. ${error}`)
    })
}
