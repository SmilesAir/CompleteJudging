const express = require("express")
const router = express.Router()

const DataManager = require("../source/dataManager.js")
const Common = require("complete-judging-common/source/backendCommon.js")

router.post("/tournamentName/:tournamentName/importTournamentDataFromAWS", async (req, res) => {
    res.json(await DataManager.importTournamentDataFromAWS(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/requestTournamentInfoFromServer", async (req, res) => {
    let data = await DataManager.getTournamentInfo(req.params.tournamentName)

    res.json(data)
})

router.get("/tournamentName/:tournamentName/getPlayingPool", async (req, res) => {
    res.json(await Common.getActivePool(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/divisionIndex/:divisionIndex/roundIndex/:roundIndex/poolIndex/:poolIndex/getPoolResults", async (req, res) => {
    res.json({})
})

module.exports = router
