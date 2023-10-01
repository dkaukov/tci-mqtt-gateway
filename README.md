<p align="center">
<img src="https://img.shields.io/github/last-commit/dkaukov/tci-mqtt-gateway/main?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/github/workflow/status/dkaukov/tci-mqtt-gateway/Node.js CI?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/github/license/dkaukov/tci-mqtt-gateway.svg?style=for-the-badge" />
</p>

# tci-mqtt-gateway for ESDR2 and ESDR3 / TCI 1.4/1.5+

The following code supports [TCI version 1.4 and 1.5](https://github.com/ExpertSDR3/TCI) for ESDR2 update 9-11 and ESDR3 alpha/beta (all versions). 

Please note that this version is reflecting current TCI features. Because of TCI is in WIP mode at this stage, this current ibrary will be updated accordingly with TCI moves to next version.
 
## Installation
* install node/npm
* `npm install` from the Gateway directory 

## Using Gateway
* `npm run start` - to start Gateway
*  close the terminal to stop Gateway

# docker
`docker run --name tci-mqtt-gateway -e MQTT_URI=mqtt://mqtt.server.host -e TCI_URI=ws://tci.server.host dkaukov/tci-mqtt-gateway`

## TCI version-dependent commands

* TCI 1.4: `drive` and `tune_drive`
* TCI 1.5 and above: `drive_15` and `tune_drive_15`

## Working with log output
Running log is located in working directory.

To disable log output on console, change `debug` to `info` in the following section of default.json (located in config folder)
`
"log": [
    {
      "level": "debug",
    }
`
