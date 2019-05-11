

const Common = require("complete-judging-common/source/backendCommon.js")

module.exports.handler = (e, c, cb) => { Common.handler(e, c, cb, async (event, context) => {

    event.body = JSON.parse(event.body) || {}

    return Common.setPlayingPool(event.pathParameters.tournamentName, event.body.data)
})}

