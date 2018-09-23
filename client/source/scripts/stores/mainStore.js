"use strict"

import {observable} from "mobx"

const Enums = require("scripts/stores/enumStore.js")


module.exports = observable({
    activeInterface: Enums.EInterface.default,
})
