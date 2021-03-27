const WSCLINET = require('ws-reconnect');
const config = require('config');
const client = new WSCLINET(config.get("SDR").tci, {
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
    console.log('MQTT: Connected to: ' + config.get("MQTT").uri);
    mqttClient.subscribe('tci-mqtt-gateway/raw/to-sdr');
})

mqttClient.on('connectFailed', function(error) {
    console.log('MQTT: ' + error.toString());
});

mqttClient.on('message', (topic, message) => {
    if(topic === 'tci-mqtt-gateway/raw/to-sdr') {
        if (client.connected) {
           client.send(message.toString());
        }
    }
})

client.on('connectFailed', function(error) {
    console.log('WS: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WS: Connected to: ' + config.get("SDR").tci);
});

client.on('message', function(message) {
    //console.log("Received: '" + message + "'");
    if (mqttClient.connected) {
        mqttClient.publish("tci-mqtt-gateway/raw/from-sdr", message);
        try {
            const event = parser.parse(message);
            console.log("TCI: " + JSON.stringify(event));
            mqttClient.publish("tci-mqtt-gateway/events/from-sdr",  JSON.stringify(event));
            Object.assign(trxState, event.data);
            mqttClient.publish("tci-mqtt-gateway/state/trx",  JSON.stringify(trxState));
        } catch (err) {
            if (!err.hasOwnProperty('location')) throw(err);
            //console.log('TCI parser error: ' + err);
        }
    }
});

async function start() {
    client.start();
}

start();
