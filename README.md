# tci-mqtt-gateway for ESDR3 / TCI 1.5

The following code supports[ TCI version 1.5](https://github.com/maksimus1210/TCI) and ESDR3. 

<u>Important</u>: ESDR2 is not supported by this version. 

## Installation
* install node/npm
* `npm install`

## Using Gateway
* `npm run start` - to start Gateway
*  close the termonal to stop Gateway

# docker
`docker run --name tci-mqtt-gateway -e MQTT_URI=mqtt://mqtt.server.host -e TCI_URI=ws://tci.server.host dkaukov/tci-mqtt-gateway`
