const express = require('express');
const router = express.Router();
const redis = require('redis');

const rateLimiter = require('../middleware/rate-limiter/rateLimiter');
const RequestCounter = require('../middleware/rate-limiter/requestCounter');

router.get(
  '/rate-limiting-max-5-window-1',
  rateLimiter(5, new RequestCounter(1)),
  function (req, res, next) {
    res.send(`Request Count: ${res.getHeader('Request-Count-In-Window')}`);
  }
);

router.get(
  '/rate-limiting-max-3-window-2',
  rateLimiter(3, new RequestCounter(2)),
  function (req, res, next) {
    res.send(`Request Count: ${res.getHeader('Request-Count-In-Window')}`);
  }
);

router.post('/redis/flushall', function (req, res, next) {
  const redisClient = redis.createClient();
  redisClient.on('error', function (error) {
    console.error(error);
  });
  redisClient.flushall(() => {
    res.send('OK');
  });
});

module.exports = router;
