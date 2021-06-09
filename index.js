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
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/" + require('path').delimiter + "./config";
const config = require('config');
const wsClient = new WSCLINET(config.get("SDR").tci, {
    retryCount: 1000,
    reconnectInterval: 5
});
const peg = require("pegjs");
const fs = require('fs');
const deserializer = peg.generate(fs.readFileSync(__dirname + '/protocol/tci-deserializer.pegjs').toString());
const mqtt = require('mqtt')
const mqttClient = mqtt.connect(config.get("MQTT").uri, { reconnectPeriod: 5000 });
const serializer = require("./protocol/tci-serializer");
const ratuV2deserializer = require("./ratu-v2/ratu-v2-deserializer");
const SyslogServer = require("syslog-server");
const server = new SyslogServer();

var trxState = { ready: false };
var ratuDevices = {};
var activeDevice = undefined;

server.on("message", (value) => {
    let device = Object.getOwnPropertyNames(ratuDevices).map(d => ratuDevices[d]).filter(d => d.device.wifi.ip === value.host).pop();
    if (device) {
        mqttClient.publish(device.statusTopic + "/log", value.message.replace(/(\r\n|\n|\r)/gm, ""));
    }
});

mqttClient.on('connect', () => {
    log.info('Connected to: ' + config.get("MQTT").uri, "MQTT");
    mqttClient.subscribe('tci-mqtt-gateway/raw/to-sdr');
    mqttClient.subscribe('tci-mqtt-gatewayv2/events/to-sdr');
    mqttClient.subscribe(config.get("ratuV2").statusTopic);
    mqttClient.subscribe(config.get("ratuV2").configTopic);
    mqttClient.subscribe("ATUconn1/cmd");
})

mqttClient.on('error', (error) => {
    log.info(error.toString(), "MQTT");
});

mqttClient.on("reconnect", () => {
    log.warn("Reconnecting...", "MQTT");
});

function testTopicPattern(topic, pattern) {
    return new RegExp(pattern.split`+`.join`[^/]+`.split`#`.join`.+`).test(topic);
}

mqttClient.on('message', (topic, message) => {
    if (testTopicPattern(topic, "ATUconn1/cmd")) {
        cmd = JSON.parse(message.toString());
        if (typeof cmd["tune"] !== "undefined" && typeof activeDevice !== "undefined") {
            mqttClient.publish(ratuDevices[activeDevice].commandTopic, JSON.stringify({ cmd: "tune" }));
        }
    } else if (testTopicPattern(topic, config.get("ratuV2").statusTopic)) {
        Object.getOwnPropertyNames(ratuDevices).forEach(function (d) {
            if (ratuDevices[d].statusTopic === topic) {
                activeDevice = d;
            }
        });
        ratuV2deserializer.deSerializeStatus(config.get("ratuV2").outputPrefix, JSON.parse(message.toString())).forEach(function (msg) {
            if (typeof msg.value !== "undefined") {
                mqttClient.publish(msg.topic, String(msg.value));
            }
        })
    } else if (testTopicPattern(topic, config.get("ratuV2").configTopic)) {
        let device = JSON.parse(message.toString());
        ratuDevices[device.device.id] = device;
        log.info("Discovered device: " + JSON.stringify(device), "DISCO");
    } else {
        if (wsClient.isConnected) {
            if (topic === 'tci-mqtt-gateway/raw/to-sdr') {
                log.info(message.toString(), "RAW")
                wsClient.send(message.toString());
            }
            if (topic === 'tci-mqtt-gatewayv2/events/to-sdr') {
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
    }
})

wsClient.on("reconnect", () => {
    log.warn("Reconnecting...", "WS");
});

wsClient.on('connect', () => {
    log.info('Connected to: ' + config.get("SDR").tci, "WS");
    trxState = { ready: false };
});

wsClient.on('message', (message) => {
    log.silly("Received: '" + message + "'", "RAW");
    mqttClient.publish("tci-mqtt-gateway/raw/from-sdr", message);
    try {
        const event = deserializer.parse(message);
        log.info("tci-mqtt-gateway/v2/events/from-sdr/" + event.topic() + " " + JSON.stringify(event), "WS");
        mqttClient.publish("tci-mqtt-gateway/events/from-sdr", JSON.stringify(event));
        mqttClient.publish("tci-mqtt-gateway/v2/events/from-sdr/" + event.topic(), JSON.stringify(event), { retain: true });
        trxState = event.toState(trxState);
        if (trxState.ready) {
            mqttClient.publish("tci-mqtt-gateway/state/trx", JSON.stringify(trxState), { retain: true });
            log.info("tci-mqtt-gateway/state/trx  " + JSON.stringify(trxState), "STATE");
        }
    } catch (err) {
        if (!err.hasOwnProperty('location')) throw (err);
        //log.silly('TCI parser error: ' + err);
    }
});

async function start() {
    log.info("Starting up.");
    wsClient.start();
    server.start({ port: 5140 });
}

start();
