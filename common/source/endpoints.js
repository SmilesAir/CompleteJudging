
const urls = {
    CREATE_TOURNAMENT: "<path>/<stage>/createTournament",
    GET_ACTIVE_TOURNAMENTS: "<path>/<stage>/getActiveTournaments",
    GET_BACKUP_RESULTS: "<path>/<stage>/judge/<judge>/time/<time>/getBackupResults",
    GET_CONSTANTS: "https://s3-us-west-2.amazonaws.com/<stage>-completejudging-constants/base-constants.json",
    GET_PLAYING_POOL: "<path>/<stage>/getPlayingPool",
    GET_POOL_RESULTS: "<path>/<stage>/getPoolResults",
    GET_S3_RESULTS: "https://s3-us-west-2.amazonaws.com/<stage>-completejudging-results/<tournamentName>-results.json",
    IMPORT_TOURNAMENT_DATA: "<path>/<stage>/tournamentName/<tournamentName>/exportTournamentData",
    REPORT_JUDGE_SCORE: "<path>/<stage>/reportJudgeScore",
    SET_JUDGE_STATE: "<path>/<stage>/tournamentName/<tournamentName>/setJudgeState",
    SET_PLAYING_POOL: "<path>/<stage>/setPlayingPool",
    SET_SCOREBOARD_DATA: "<path>/<stage>/tournamentName/<tournamentName>/setScoreboardData"
}

module.exports.buildUrl = function(lanMode, key, pathParams, queryParams) {
    let path = undefined
    if (lanMode) {
        path = "http://localhost:3000"
    } else {
        path = __STAGE__ === "DEVELOPMENT" ? "https://0uzw9x3t5g.execute-api.us-west-2.amazonaws.com" : "https://w0wkbj0dd9.execute-api.us-west-2.amazonaws.com"
    }

    let pathReplaceData = {
        "path": path,
        "stage": __STAGE__.toLowerCase()
    }

    Object.assign(pathReplaceData, pathParams)

    let url = urls[key]
    for (let wildName in pathReplaceData) {
        url = url.replace(`<${wildName}>`, pathReplaceData[wildName])
    }

    let firstQueryParam = true
    for (let paramName in queryParams) {
        let prefix = firstQueryParam ? "?" : "&"
        firstQueryParam = false
        
        url += `${prefix}${paramName}=${queryParams[paramName]}`
    }

    return url
}
