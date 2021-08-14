"use strict"

const Mobx = require("mobx")

module.exports = Mobx.observable({
    language: "English",
    languageChoices: [ "English", "Spanish" ]
})
