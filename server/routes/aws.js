const express = require("express")
const router = express.Router()

const DataManager = require("../managers/dataManager.js")

router.post("/development/tournamentName/:tournamentName/importTournamentDataFromAWS", async (req, res) => {
    res.json(await DataManager.importTournamentDataFromAWS(req.params.tournamentName))
})

router.get("/development/tournamentName/:tournamentName/requestTournamentInfoFromServer", async (req, res) => {
    let data = await DataManager.getTournamentInfo(req.params.tournamentName)

    res.json(data)
})

module.exports = router
