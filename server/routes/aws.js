const express = require("express")
const router = express.Router()

const DataManager = require("../source/dataManager.js")
const Common = require("complete-judging-common/source/backendCommon.js")

router.post("/tournamentName/:tournamentName/importTournamentDataFromAWS", async (req, res) => {
    res.json(await DataManager.importTournamentDataFromAWS(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/requestTournamentInfoFromServer", async (req, res) => {
    res.json(await DataManager.getTournamentInfo(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/getPlayingPool", async (req, res) => {
    res.json(await Common.getActivePool(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/divisionIndex/:divisionIndex/roundIndex/:roundIndex/poolIndex/:poolIndex/getPoolResults", async (req, res) => {
    res.json(Common.getPoolResults(req.params.tournamentName,
        req.params.divisionIndex,
        req.params.roundIndex,
        req.params.poolIndex))
})

module.exports = router
