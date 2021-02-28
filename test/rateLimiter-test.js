const assert = require('assert');
const sinon = require('sinon');
const rateLimit = require('../middleware/rate-limiter/rateLimiter');

const mockReqCounter = (count) => ({
  add: sinon.stub().resolves(count),
});

const mockRequest = (ip) => ({
  ip: ip,
});

const mockResponse = (onSendCalled) => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.locals = sinon.stub().returns(res);
  res.send = () => {
    onSendCalled();
  };
  return res;
};

describe('rateLimiter', function () {
  let testCase = [
    { limit: 2, currentCount: 1 },
    { limit: 2, currentCount: 2 },
    { limit: 10, currentCount: 5 },
    { limit: 10, currentCount: 10 },
  ];
  testCase.forEach(({ limit, currentCount }) =>
    it(`should call next() if request count ${currentCount} <= limit ${limit}`, function (done) {
      const nextShouldBeCalled = done;
      const _mockReqCounter = mockReqCounter(currentCount);
      const middlewareRateLimit = rateLimit(limit, _mockReqCounter);

      middlewareRateLimit(mockRequest('any'), mockResponse(), () => {
        nextShouldBeCalled();
      });
    })
  );

  testCase = [
    { limit: 1, currentCount: 2 },
    { limit: 2, currentCount: 3 },
    { limit: 10, currentCount: 11 },
    { limit: 10, currentCount: 15 },
  ];
  testCase.forEach(({ limit, currentCount }) =>
    it(`should send error if request count ${currentCount} > limit ${limit}`, function (done) {
      const nextShouldBeCalled = done;
      const _mockReqCounter = mockReqCounter(currentCount);
      const middlewareRateLimit = rateLimit(limit, _mockReqCounter);

      middlewareRateLimit(
        mockRequest('any'),
        mockResponse(() => {
          nextShouldBeCalled();
        }),
        () => {
          done(
            new Error('next() should not be called when count exceed limit')
          );
        }
      );
    })
  );

  testCase = [
    { ip: '192.168.0.1' },
    { ip: '192.168.0.2' },
    { ip: '192.168.0.100' },
  ];
  testCase.forEach(({ ip }) =>
    it(`valid request should call RequestCounter.add() with correct ip (${ip})`, function (done) {
      const limit = 10;
      const currentCount = 20;
      const nextShouldBeCalled = done;
      let _mockReqCounter = mockReqCounter(currentCount);
      const middlewareRateLimit = rateLimit(limit, _mockReqCounter);

      middlewareRateLimit(
        mockRequest(ip),
        mockResponse(() => {
          assert.ok(_mockReqCounter.add.calledWith(ip));
          nextShouldBeCalled();
        }),
        () => {
          done(
            new Error('next() should not be called when count exceed limit')
          );
        }
      );
    })
  );
});
