

module.exports.vibrateSingleShort = function() {
    navigator.vibrate(50)
}

module.exports.vibrateSingleMedium = function() {
    navigator.vibrate(150)
}

module.exports.vibrateDoubleShort = function() {
    navigator.vibrate([ 50, 100, 50 ])
}
