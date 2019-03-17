var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/test', function(req, res, next) {
  res.json({
    hey: "aws test"
  })
});

module.exports = router;
