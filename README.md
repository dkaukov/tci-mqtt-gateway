# tci-mqtt-gateway for ESDR3 / TCI 1.5

The following code supports[ TCI version 1.5](https://github.com/maksimus1210/TCI) and ESDR3. 

<u>Important</u>: ESDR2 is not supported by this version. 

## Acknowledgements
* [TCI protocol](https://github.com/maksimus1210/TCI)


* install node/npm
* `npm install`
* `npm run start`

# docker
`docker run --name tci-mqtt-gateway -e MQTT_URI=mqtt://mqtt.server.host -e TCI_URI=ws://tci.server.host dkaukov/tci-mqtt-gateway`
