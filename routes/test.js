const express = require('express');
const router = express.Router();

const rateLimiter = require('../middleware/rate-limiter/rateLimiter');
const RequestCounter = require('../middleware/rate-limiter/requestCounter');

/* GET home page. */
router.get(
  '/rate-limiting',
  rateLimiter(60, new RequestCounter(60)),
  function (req, res, next) {
    res.send(`${res.locals.reqCount}`);
  }
);

module.exports = router;
