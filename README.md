<p align="center">
<img src="https://img.shields.io/github/last-commit/dkaukov/tci-mqtt-gateway/main?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/github/workflow/status/dkaukov/tci-mqtt-gateway/Node.js CI?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/github/license/dkaukov/tci-mqtt-gateway.svg?style=for-the-badge" />
</p>

# tci-mqtt-gateway for ESDR3 / TCI 1.5

The following code supports [TCI version 1.5](https://github.com/maksimus1210/TCI) and ESDR3. 

Please note that this version is reflecting current TCI features. Because of TCI is in WIP mode at this stage, this current ibrary will be updated accordingly woth TCI moves to next version.

<b>Important</b>: ESDR2 is not supported by this version. For ESDR2 / TCI 1.4 please use [this GW version](https://github.com/dkaukov/tci-mqtt-gateway)

## Installation
* install node/npm
* `npm install` from the Gateway directory 

## Using Gateway
* `npm run start` - to start Gateway
*  close the termonal to stop Gateway

# docker
`docker run --name tci-mqtt-gateway -e MQTT_URI=mqtt://mqtt.server.host -e TCI_URI=ws://tci.server.host dkaukov/tci-mqtt-gateway`
