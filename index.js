const { Factory } = require('winston-simple-wrapper')
const log = new Factory({
  transports: [{
      type: 'console',
      level: 'debug'
    }, {
      type: 'file',
      level: 'debug',
      filename: 'logs/gateway.log'
  }]
})
const WSCLINET = require('ws-reconnect');
const config = require('config');
const wsClient = new WSCLINET(config.get("SDR").tci, {
    retryCount: 1000, 
    reconnectInterval: 5 
});
const peg = require("pegjs");
const fs = require('fs');
const parser = peg.generate(fs.readFileSync('protocol/tci.pegjs').toString());
const mqtt = require('mqtt')
const mqttClient =  mqtt.connect(config.get("MQTT").uri, {reconnectPeriod: 5000});
var trxState = {};

mqttClient.on('connect', () => {
    log.info('Connected to: ' + config.get("MQTT").uri, "MQTT");
    mqttClient.subscribe('tci-mqtt-gateway/raw/to-sdr');
})

mqttClient.on('error', (error) => { 
    log.info(error.toString(), "MQTT");
});

mqttClient.on("reconnect", () =>  {
    log.warn("Reconnecting...", "MQTT");
});

mqttClient.on('message', (topic, message) => {
    if(topic === 'tci-mqtt-gateway/raw/to-sdr') {
        if (wsClient.connected) {
           wsClient.send(message.toString());
        }
    }
})

wsClient.on("reconnect", () => {
    log.warn("Reconnecting...", "WS");
});

wsClient.on('connect', () => {
    log.info('Connected to: ' + config.get("SDR").tci, "WS");
});

wsClient.on('message', (message) => {
    //log.info("Received: '" + message + "'");
    mqttClient.publish("tci-mqtt-gateway/raw/from-sdr", message);
    try {
        const event = parser.parse(message);
        log.info("TCI: " + JSON.stringify(event), "WS");
        mqttClient.publish("tci-mqtt-gateway/events/from-sdr",  JSON.stringify(event));
        Object.assign(trxState, event.data);
        mqttClient.publish("tci-mqtt-gateway/state/trx",  JSON.stringify(trxState));
    } catch (err) {
        if (!err.hasOwnProperty('location')) throw(err);
        //log.info('TCI parser error: ' + err);
    }
});

async function start() {
    log.info("Starting up.");
    wsClient.start();
}

start();
