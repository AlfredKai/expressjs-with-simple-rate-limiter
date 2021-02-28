const redis = require('redis');

class RequestCounter {
  constructor(window) {
    this.window = window;
    this.redisClient = redis.createClient();
    this.redisClient.on('error', function (error) {
      console.error(error);
    });
  }

  add(key) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.redisClient
        .multi()
        .incr(key)
        .ttl(key)
        .exec(function (err, replies) {
          if (err) {
            return reject(err);
          }
          if (replies[1] == -1) {
            self.redisClient.expire(key, self.window);
          }
          resolve(replies[0], replies[1]);
        });
    });
  }
}

module.exports = RequestCounter;
