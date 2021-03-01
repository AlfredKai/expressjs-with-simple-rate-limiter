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
  res.set = sinon.stub();
  res.send = () => {
    onSendCalled();
  };
  return res;
};

describe('rateLimiter', function () {
  let testCase = [
    { max: 2, currentCount: 1 },
    { max: 2, currentCount: 2 },
    { max: 10, currentCount: 5 },
    { max: 10, currentCount: 10 },
  ];
  testCase.forEach(({ max, currentCount }) =>
    it(`should call next() and set count in header 'Request-Count-In-Window' if request count ${currentCount} <= max ${max}`, function (done) {
      const nextShouldBeCalled = done;
      const _mockReqCounter = mockReqCounter(currentCount);
      const _mockResponse = mockResponse()
      const middlewareRateLimit = rateLimit(max, _mockReqCounter);

      middlewareRateLimit(mockRequest('any'), _mockResponse, () => {
        assert.ok(_mockResponse.set.calledWith('Request-Count-In-Window', currentCount))
        nextShouldBeCalled();
      });
    })
  );

  testCase = [
    { max: 1, currentCount: 2 },
    { max: 2, currentCount: 3 },
    { max: 10, currentCount: 11 },
    { max: 10, currentCount: 15 },
  ];
  testCase.forEach(({ max, currentCount }) =>
    it(`should send error if request count ${currentCount} > max ${max}`, function (done) {
      const nextShouldBeCalled = done;
      const _mockReqCounter = mockReqCounter(currentCount);
      const middlewareRateLimit = rateLimit(max, _mockReqCounter);

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
    it(`should call RequestCounter.add() with correct ip (${ip}) when request is valid`, function (done) {
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
