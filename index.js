const WebSocketClient = require('websocket').client;
const config = require('config');
const client = new WebSocketClient();
const peg = require("pegjs");
const fs = require('fs');
const parser = peg.generate(fs.readFileSync('protocol/tci.pegjs').toString());
const mqtt = require('mqtt')
const mqttClient =  mqtt.connect(config.get("MQTT").uri);
var trxState = {};

mqttClient.on('connect', () => {
    console.log('Mqtt Client Connected');
    mqttClient.subscribe('tci-mqtt-gateway/raw/to-sdr');
    client.connect(config.get("SDR").tci);
})



client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
    setTimeout(start, 5000);
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("WS: Connection Error: " + error.toString());
        setTimeout(start, 5000);
    });
    connection.on('close', function() {
        console.log('WS: Connection Closed');
    });
    mqttClient.on('message', (topic, message) => {
        if(topic === 'tci-mqtt-gateway/raw/to-sdr') {
            if (connection.connected) {
                connection.sendUTF(message.toString());
            }
        }
    })
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
            if (mqttClient.connected) {
                mqttClient.publish("tci-mqtt-gateway/raw/from-sdr", message.utf8Data);
                try {
                    const event = parser.parse(message.utf8Data);
                    console.log("TCI: " + JSON.stringify(event));
                    mqttClient.publish("tci-mqtt-gateway/events/from-sdr",  JSON.stringify(event));
                    Object.assign(trxState, event.data);
                    mqttClient.publish("tci-mqtt-gateway/state/trx",  JSON.stringify(trxState));
                } catch (err) {
                    if (!err.hasOwnProperty('location')) throw(err);
                    //console.log('TCI parser error: ' + err);
    
                }
            }

        }
    });
    
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

async function start() {
    //client.connect(config.get("SDR").tci);
}

start();
