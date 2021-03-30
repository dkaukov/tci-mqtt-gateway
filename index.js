const { Factory } = require('winston-simple-wrapper')
const log = new Factory({
  transports: [{
      type: 'console',
      level: 'silly'
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
const deserializer = peg.generate(fs.readFileSync('protocol/tci-deserializer.pegjs').toString());
const mqtt = require('mqtt')
const mqttClient =  mqtt.connect(config.get("MQTT").uri, {reconnectPeriod: 5000});
const serializer = require("./protocol/tci-serializer");
var trxState = {ready: false};

mqttClient.on('connect', () => {
    log.info('Connected to: ' + config.get("MQTT").uri, "MQTT");
    mqttClient.subscribe('tci-mqtt-gateway/raw/to-sdr');
    mqttClient.subscribe('tci-mqtt-gatewayv2/events/to-sdr');
})

mqttClient.on('error', (error) => { 
    log.info(error.toString(), "MQTT");
});

mqttClient.on("reconnect", () =>  {
    log.warn("Reconnecting...", "MQTT");
});

mqttClient.on('message', (topic, message) => {
    if (wsClient.isConnected) {
        if(topic === 'tci-mqtt-gateway/raw/to-sdr') {
            log.info(message.toString(), "RAW")
            wsClient.send(message.toString());
        }
        if(topic === 'tci-mqtt-gatewayv2/events/to-sdr') {            
            try {
                let msg = serializer.serialize(JSON.parse(message.toString()));
                log.info(msg, "SER");
                wsClient.send(msg);
            } catch (err) {
                log.error('TCI serializer error: ' + err, "SER");
            }
        }
    } else {
        log.warn(`wsClient is not connected, discarding: ${message.toString}`, "MQTT")
    }
})

wsClient.on("reconnect", () => {
    log.warn("Reconnecting...", "WS");
});

wsClient.on('connect', () => {
    log.info('Connected to: ' + config.get("SDR").tci, "WS");
    trxState = {ready: false};
});

wsClient.on('message', (message) => {
    log.silly("Received: '" + message + "'", "RAW");
    mqttClient.publish("tci-mqtt-gateway/raw/from-sdr", message);
    try {
        const event = deserializer.parse(message);
        log.info("tci-mqtt-gateway/v2/events/from-sdr/" + event.topic() + " " + JSON.stringify(event), "WS");
        mqttClient.publish("tci-mqtt-gateway/events/from-sdr",  JSON.stringify(event));
        mqttClient.publish("tci-mqtt-gateway/v2/events/from-sdr/" + event.topic(),  JSON.stringify(event), {retain: true});
        trxState =  event.toState(trxState);
        if (trxState.ready) {
            mqttClient.publish("tci-mqtt-gateway/state/trx",  JSON.stringify(trxState), {retain: true});
            log.info("tci-mqtt-gateway/state/trx  " + JSON.stringify(trxState), "STATE");
        }
    } catch (err) {
        if (!err.hasOwnProperty('location')) throw(err);
        //log.silly('TCI parser error: ' + err);
    }
});

async function start() {
    log.info("Starting up.");
    wsClient.start();
}

start();
