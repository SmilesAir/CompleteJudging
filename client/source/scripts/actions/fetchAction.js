
const MainStore = require("scripts/stores/mainStore.js")


module.exports.fetch = function(path, params) {
    let url = (MainStore.lanMode ? "http://localhost:3000/aws/" : "https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com/development/") + path
    return fetch(url, params)
}
