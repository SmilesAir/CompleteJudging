

const Common = require("./common.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    return await Common.getActivePool(event.queryStringParameters.tournamentName)
})}
