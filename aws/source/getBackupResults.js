
const Common = require("./common.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {
    return Common.getBackupResults(decodeURI(event.pathParameters.judgeName), parseInt(event.pathParameters.startTime))
})}
