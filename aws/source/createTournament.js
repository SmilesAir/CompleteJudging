
const AWS = require('aws-sdk')
let docClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = function(event, context, callback) {

    //event.body = JSON.parse(event.body) || {}

    let tournamentName = event.body.tournamentName
    let tournamentInfoKey = tournamentName + Date.now()

    let getParams = {
        TableName: process.env.ACTIVE_TOURNAMENT_KEYS,
        Key: {"key": tournamentName}
    }
    docClient.get(getParams).promise().then((response) => {
        if (Object.keys(response).length === 0 && response.constructor === Object) {
            let putParams = {
                TableName : process.env.TOURNAMENT_INFO,
                Item: {
                    key: tournamentInfoKey,
                    tournamentName: tournamentName,
                }
            }
            return docClient.put(putParams).promise()
        } else {
            throw new Error(`Error, ${tournamentName} already exists`)
        }
    }).then((response) => {
        let putParams = {
            TableName : process.env.ACTIVE_TOURNAMENT_KEYS,
            Item: {
                key: tournamentName,
                tournamentName: tournamentName,
                tournamentInfoKey: tournamentInfoKey
            }
        }
        return docClient.put(putParams).promise()
    }).then((response) => {
        callback(null, "Success, Created Table")
    }).catch((error) => {
        console.log("catch", error)

        callback(error)
    })
}
