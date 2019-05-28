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

router.post("/tournamentName/:tournamentName/exportTournamentDataToAWS", async (req, res) => {
    await DataManager.exportTournamentDataToAWS(req.params.tournamentName)

    res.json({
        success: true
    })
})

router.get("/tournamentName/:tournamentName/getPlayingPool", async (req, res) => {
    res.json(await Common.getActivePool(req.params.tournamentName))
})

router.get("/tournamentName/:tournamentName/divisionIndex/:divisionIndex/roundIndex/:roundIndex/poolIndex/:poolIndex/getPoolResults", async (req, res) => {
    let data = await Common.getPoolResults(req.params.tournamentName,
        req.params.divisionIndex,
        req.params.roundIndex,
        req.params.poolIndex)
    res.json(data)
})

router.post("/reportJudgeScore", async (req, res) => {
    if (req.body.tournamentName !== undefined &&
        req.body.judgeId !== undefined &&
        req.body.results !== undefined) {

        await Common.reportJudgeScore(req.body.tournamentName, req.body.judgeId, req.body.results)

        res.json({
            success: true
        })
    } else {
        res.json({
            success: false
        })
    }
})

router.post("/tournamentName/:tournamentName/setPlayingPool", async (req, res) => {
    await Common.setPlayingPool(req.params.tournamentName, req.body.data)

    res.json({
        success: true
    })
})

router.post("/tournamentName/:tournamentName/setJudgeState", async (req, res) => {
    await Common.setJudgeState(req.params.tournamentName, req.body.judgeId, req.body.status)

    res.json({
        success: true
    })
})

router.post("/tournamentName/:tournamentName/divisionIndex/:divisionIndex/roundIndex/:roundIndex/poolIndex/:poolIndex/clearPoolResults", async (req, res) => {
    console.log("found clear resutsl")
    let data = await Common.clearPoolResults(req.params.tournamentName,
        req.params.divisionIndex,
        req.params.roundIndex,
        req.params.poolIndex)
    res.json(data)
})

module.exports = router
