const express = require("express")
const router = express.Router()
const fetch = require("node-fetch")

const EndpointStore = require("complete-judging-common/source/endpoints.js")

function importTournamentDataFromAWS(tournamentName) {
  return fetch(EndpointStore.buildUrl(false, "IMPORT_TOURNAMENT_DATA", {
      tournamentName: tournamentName
  }), {
      method: "GET",
      headers: {
          "Content-Type": "application/json"
      }
  }).then((response) => {
      return response.json()
  }).then((response) => {
      return response
  }).catch((error) => {
      console.log("Import Tournament Info Error", error)
  })
}

/* GET users listing. */
router.get("/importTournamentDataFromAWS", async (req, res, next) => {
  console.log(await importTournamentDataFromAWS("IFO2019Ryan"))
  
  res.json({
    success: true
  })
})

module.exports = router
