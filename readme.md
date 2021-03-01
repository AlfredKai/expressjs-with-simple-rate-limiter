# Expressjs with Simple Rate-Limiter

Express server with custom rate-limiting middleware implemented using redis.

## Requirements

- NodeJS
- Redis

### Built With

- Express application generator
- Redis
- mocha
- sinon
- Cypress

## Usage

All routes applied rate-limiting by default(60 requests per minute).

You must have a `redis-server` running on your local with defaults host and port  (127.0.0.1:6379) to start the server.

Install using yarn:

```bash
yarn install
```

Start dev server.

```bash
yarn start
```

Then, visit default root `http://localhost:3000` and see the current request count in header.

```header
Request-Count-In-Window: 1
```

Or receive `429 (Too Many Requests) Error` if requests exceed max limit which is 60 requests per minute.

Otherwise, visit testing page `http://localhost:3000/test/rate-limiting-max-3-window-2` configured with max limit 3 and 2 seconds window to test more easily.

## Rate Limit Middleware

Apply `rateLimiter` by setting *max request count* per window seconds and `RequestCounter` with given *window seconds*.

```js
const rateLimiter = require('./middleware/rate-limiter/rateLimiter');
const RequestCounter = require('./middleware/rate-limiter/requestCounter');

// apply a rate-limiting middleware with max limit 60 requests in 30 seconds window.
app.use(rateLimiter(60, new RequestCounter(30)));
```

`RequestCounter` provides `add` method which will resolve the current count with the given key and reset when TTL expired (use `redis` internally).

## Unit Test

Start mocha to test rateLimiter.js (no redis required):

```bash
yarn test
```

Since the main logic (TTL) in `RequestCounter` was implemented using redis, there's not much reason to have unit test. See the end-to-end test below.

## Cypress End-to-End Test

Run Cypress end-to-end test (redis required):

```bash
yarn test:end2end
```

If you fail running on Ubuntu, please check [Cypress Dependencies](https://docs.cypress.io/guides/continuous-integration/introduction.html#Dependencies).
