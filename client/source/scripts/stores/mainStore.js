"use strict"

const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")


module.exports = Mobx.observable({
    activeInterface: Enums.EInterface.default,
    startupTournamentName: undefined,
    tournamentName: undefined,
    saveData: undefined,
    tournamentInfoList: [],
    userId: undefined,
    showControlsHeader: true
})
