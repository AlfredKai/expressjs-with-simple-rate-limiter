const redis = require('redis');

/**
 * Storage of request count implemented using redis.
 */
class RequestCounter {
  /**
   * 
   * @param {number} TTL window in seconds. 
   */
  constructor(window) {
    this.window = window;
    this.redisClient = redis.createClient();
    this.redisClient.on('error', function (error) {
      console.error(error);
    });
  }

  /**
   * 
   * @param {string} key 
   * @return {Promise<number>} resolve current count within TTL.
   */
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
