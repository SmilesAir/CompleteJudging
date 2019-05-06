
let DataHarness = undefined
try {
    DataHarness = require("source/dataHarnessAws.js")
    console.log("Found Aws data harness")
} catch (e) { }

if (DataHarness === undefined) {
    try {
        DataHarness = require("./dataHarnessServer.js")
        console.log("Found Server data harness")
    } catch (e) { }
}

if (DataHarness === undefined) {
    throw new Error("No Data Harness Loaded")
}

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

module.exports.getActivePool = async function(tournamentName) {
    let tournamentKey = await DataHarness.getTournamentKey(tournamentName)
    if (tournamentKey.playingPoolKey !== undefined) {
        let pool = await module.exports.getPoolData(tournamentKey.playingPoolKey)
        pool.serverTime = Date.now()

        console.log("get active pool", pool)
        return pool
    } else {
        throw new Error(`${tournamentName} doesn't have a playing pool`)
    }
}

module.exports.getPoolData = async function(poolKey) {
    let poolItem = await DataHarness.getPoolItem(poolKey)
    return poolItem.data
}

module.exports.getPoolNamePrefix = function() {
    return "pool-"
}

module.exports.getResultsKeyPrefix = function() {
    return "resultsKey-"
}

module.exports.getPoolNameFromData = function(poolData) {
    return module.exports.getPoolName(poolData.pool.divisionIndex, poolData.pool.roundIndex, poolData.pool.poolIndex)
}

module.exports.getPoolName = function(divisionIndex, roundIndex, poolIndex) {
    return `${module.exports.getPoolNamePrefix()}${divisionIndex}-${roundIndex}-${poolIndex}`
}

module.exports.getExisitingPoolItem = function(tournamentKey, poolName) {
    let oldPoolDataKey = tournamentKey[poolName]
    if (oldPoolDataKey !== undefined) {
        return DataHarness.getPoolItem(oldPoolDataKey)
    }

    return undefined
}

module.exports.getPoolResults = async function(tournamentName, divisionIndex, roundIndex, poolIndex) {
    let tournamentKey = await DataHarness.getTournamentKey(tournamentName)
    let poolName = module.exports.getPoolName(divisionIndex, roundIndex, poolIndex)
    let poolItem = await module.exports.getExisitingPoolItem(tournamentKey, poolName)

    let getPromises = []
    for (let resultsAttributeName in poolItem) {
        if (resultsAttributeName.startsWith(module.exports.getResultsKeyPrefix())) {
            getPromises.push(module.exports.getResultData(poolItem[resultsAttributeName]))
        }
    }

    return Promise.all(getPromises)
}

module.exports.getBackupResults = async function(judgeName, startTime) {
    let resultsList = await DataHarness.getResultsHistory(judgeName, startTime)
    let ret = []
    for (let result of resultsList) {
        ret.push({
            time: result.time,
            data: result.data
        })
    }

    ret.sort((a, b) => {
        return b.time - a.time
    })

    return {
        resultsList: ret
    }
}

module.exports.getResultData = async function(resultsKey) {
    let item = await DataHarness.getResultItem(resultsKey)
    return {
        judgeName: resultsKey.judgeName,
        data: item.data
    }
}

///////////////////////// Harness Passthrough /////////////////////////
module.exports.getTournamentInfo = function(key) {
    return DataHarness.getTournamentInfo(key)
}

module.exports.getTournamentKey = function(tournamentName) {
    return DataHarness.getTournamentKey(tournamentName)
}

module.exports.getPoolItem = async function(poolKey) {
    return DataHarness.getPoolItem(poolKey)
}

module.exports.getResultItem = function(resultsKey) {
    return DataHarness.getResultItem(resultsKey)
}

module.exports.updateActivePoolAttribute = async function(tournamentName, attributeName, attributeValue) {
    return DataHarness.updateActivePoolAttribute(tournamentName, attributeName, attributeValue)
}

module.exports.updateTournamentKeyWithObject = async function(tournamentName, newObject) {
    return DataHarness.updateTournamentKeyWithObject(tournamentName, newObject)
}

module.exports.updateTournamentKeyPlayingPool = async function(tournamentName, playingPoolKey) {
    return DataHarness.updateTournamentKeyPlayingPool(tournamentName, playingPoolKey)
}
