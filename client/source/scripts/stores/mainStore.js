"use strict"

const Mobx = require("mobx")

const Enums = require("scripts/stores/enumStore.js")


module.exports = Mobx.observable({
    activeInterface: Enums.EInterface.default,
})
