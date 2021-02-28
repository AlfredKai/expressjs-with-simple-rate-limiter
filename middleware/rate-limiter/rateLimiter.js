const rateLimit = (maxReqCount, reqCounter) => {
  if (!reqCounter) throw new Error('No valid RequestCounter');
  return (req, res, next) => {
    reqCounter
      .add(req.ip) // suppose there is no proxy ahead
      .then((count) => {
        if (count > maxReqCount) {
          res.status(429).send('Error');
          return;
        }
        res.locals.reqCount = count;
        next();
      })
      .catch((e) => {
        console.error('Error in RequestCounter', e);
        res.status(500).send();
      });
  };
};

module.exports = rateLimit;
