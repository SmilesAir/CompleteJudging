const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

const Common = require("complete-judging-common/source/backendCommon.js")

const idListKey = "constantsIdList"

module.exports.uploadConstants = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    let id = decodeURI(event.pathParameters.constantsId)
    let body = JSON.parse(event.body)

    let putContantsParams = {
        TableName : process.env.CONSTANTS_TABLE,
        Item: {
            key: id,
            constants: body.constants
        }
    }
    await docClient.put(putContantsParams).promise().catch((error) => {
        throw error
    })

    let idList = undefined
    let getIdListParams = {
        TableName: process.env.CONSTANTS_TABLE,
        Key: {"key": idListKey}
    }
    await docClient.get(getIdListParams).promise().then((response) => {
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            if (response.Item.ids.find((data) => data === id) === undefined) {
                idList = response.Item.ids
                idList.push(id)
            }
        }
        else {
            idList = [id]
        }
    }).catch((error) => {
        throw error
    })

    if (idList !== undefined) {
        let putListParams = {
            TableName : process.env.CONSTANTS_TABLE,
            Item: {
                key: idListKey,
                ids: idList
            }
        }
        await docClient.put(putListParams).promise().catch((error) => {
            throw error
        })
    }

    return {
        success: true
    }
})}

module.exports.getConstants = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    let id = decodeURI(event.pathParameters.constantsId)

    let constants = undefined
    let getIdListParams = {
        TableName: process.env.CONSTANTS_TABLE,
        Key: {"key": id}
    }
    await docClient.get(getIdListParams).promise().then((response) => {
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            constants = response.Item.constants
        }
    }).catch((error) => {
        throw error
    })

    return {
        constants: constants,
        success: constants !== undefined
    }
})}

module.exports.getConstantsList = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    let idList = undefined
    let getIdListParams = {
        TableName: process.env.CONSTANTS_TABLE,
        Key: {"key": idListKey}
    }
    await docClient.get(getIdListParams).promise().then((response) => {
        if (Object.keys(response).length !== 0 || response.constructor !== Object) {
            idList = response.Item.ids
        }
    }).catch((error) => {
        throw error
    })

    return {
        constantsIdList: idList,
        success: idList !== undefined
    }
})}
