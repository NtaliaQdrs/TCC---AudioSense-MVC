var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('painelAdmin1');
});



module.exports = router;