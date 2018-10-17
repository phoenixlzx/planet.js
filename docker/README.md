Dockerized planet.js
=========

## Building

```shell
docker build . -t planetjs
```

## Running

Port 80 will be exposed for planet.js. You should map the port and configure
your own reverse proxy for public accessing.

## Configuration

Configuration file should be mounted at `/config/config.yml`. Make sure your
output directory is set to `public`.

## Environment Variables

### `REFRESH_INTERVAL`

Set the automatic refresh interval for planet.js. A number which represents the
interval in minutes is required.
Default to 30 minues.
