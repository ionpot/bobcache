# Bob's Less-Than-Stellar Caching Proxy
A caching proxy targeting _Bob's Epic Drone Shack_ by default, though the target can be changed in the config file.

It only attempts to cache the _GET_ routes provided in the config file, and will forward other routes as is, without caching.

It uses the built-in _Map_ object to hold cache entries, and another _Map_ to manage the timers tracking expiration.

Upon a request, the proxy will fire a request to the server, and a cache fetch, at the same time. In other words, the proxy keeps the cache entry at hand, in case the request fails.

As soon as a request fails, the cache entry is returned. Proxy will keep polling the target server until it gets a successful response, regardless of whether the client was served from cache or not.

If there was no cache entry, the client is going to have to wait for the proxy to receive a successful response from the server:
- Class 1 and 2 responses are considered successful.
- Class 3 is fatal, and forwarded to client.
- Class 4 and 5 trigger a retry.

Conversely, if the cache fetch is taking its time (could be a network issue), this gives target server a chance to outrun the cache, in which case that response is served to the client instead.

## Running
Needs Node.js v6 or higher to run. There are no dependencies, so the server can be run using either of the following commands:
```
$ node server.js
$ npm start
```

The server will listen on port number specified in the config file. This can be overridden:
```
$ node server.js 1234
$ npm start -- 1234
```

To run the tests, _mocha_ framework needs to be fetched:
```
$ npm install --dev
$ npm test
```

## Configuration
The _config.json_ file contains the default configuration the proxy uses. The fields are:
- __target__ _object_: Information on how to connect to target server, and which routes to cache.
  - __host__ _string_: The domain name, or the IP address of the target server, without the protocol bit (_http://_).
  - __port__ _number_: Port number the target server is listening on.
  - __tls__ _bool_: Which HTTP client to be used when making a request to this server. `true` uses HTTPS, `false` uses HTTP.
  - __routes__ _regexp strings_: An array of patterns. If a GET url matches this pattern, it will be cached. The proxy adds _^_ and _$_ characters to these patterns, so they are matched from start to end.
- __port__ _number_: Port number the proxy is going to listen on.
- __expiration__ _object_: Dictates how long a cache entry should last. This object is passed straight to `utils/time.js` to be crunched into a millisecond value. Accepted fields are (all _number_): _milliseconds_, _seconds_, _minutes_, _hours_, _days_, _months_, _years_

## Shortcomings
- Number one on this list would be the retry mechanism. It doesn't wait before the next retry, and has no maximum limit. If a cachable route becomes 404 (for example), the proxy would keep firing requests to it forever. Very first thing I would fix.
- Does not handle timeouts. After a certain time, the proxy should respond from cache when target server is unresponsive.
- Headers are blindly discarded in the case of cachable routes. Only the `Host` and `Content-Type` headers are taken into consideration. This may cause issues with session cookies and authentication.
- Using a built-in _Map_ as a caching mechanism is not a scalable approach, so it could be swapped with a more production-grade caching technology. The code is laid out with this in mind.
- While the proxy can communicate with targets using TLS, it itself doesn't have a valid certificate. Therefore, the connections between the client and the proxy is not secure. A valid certificate needs to be arranged for production use.
