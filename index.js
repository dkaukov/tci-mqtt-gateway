process.env["NODE_CONFIG_DIR"] = __dirname + "/config/" + require('path').delimiter + "./config";

const peg = require("pegjs");
const fs = require('fs');
const { Factory} = require('winston-simple-wrapper')
const WSCLINET = require('ws-reconnect');
const config = require('config');
const deserializer = peg.generate(fs.readFileSync(__dirname + '/protocol/tci-deserializer.pegjs').toString());
const mqtt = require('mqtt')
const serializer = require("./protocol/tci-serializer");
const ratuV2deserializer = require("./ratu-v2/ratu-v2-deserializer");
const BinaryParser = require('binary-parse');
const parser = new BinaryParser({
	Stream: {
        receiver: "uint32le", // receiver number 
        sample_rate: "uint32le",  // sampling rate
        format: "uint32le",
        codec: "uint32le",
        crc: "uint32le",
        length: "uint32le",
        type: "uint32le",
        reserv: ["array", "uint32le", 9],
        data: ["array", "floatle", 4096]
	},
});


const Speaker = require('speaker-arm64');
const speaker = new Speaker({
    channels: 2,          
    bitDepth: 32,         
    sampleRate: 48000,
    float: true       
});

const TOPIC_SHARED_CONSUMER_PREFIX = "$share/tci-mqtt-gateway-group/";
const TOPIC_PREFIX = "tci-mqtt-gateway/";
const TOPIC_EVENTS_FROM_SDR = TOPIC_PREFIX + "events/from-sdr";
const TOPIC_SDR_STATE = TOPIC_PREFIX + "state/trx";
const TOPIC_EVENTS_FROM_SDR_RAW = TOPIC_PREFIX + "raw/from-sdr";
const TOPIC_EVENTS_FROM_SDR_V2 = TOPIC_PREFIX + "v2/events/from-sdr/";
const TOPIC_EVENTS_TO_SDR_RAW = TOPIC_PREFIX + "raw/to-sdr";
const TOPIC_EVENTS_TO_SDR_V2 = "tci-mqtt-gatewayv2/events/to-sdr"
const TOPIC_ATU_V1_CMD = "ATUconn1/cmd";

var trxState = {
    ready: false
};
var ratuDevices = {};
var activeDevice = undefined;

const log = new Factory({
    transports: config.get("log")
})

const wsClient = new WSCLINET(config.get("SDR").tci, {
    retryCount: 1000,
    reconnectInterval: 5
}).on("reconnect", () => {
    log.warn("Reconnecting...", "WS");
}).on('connect', () => {
    log.info('Connected to: ' + config.get("SDR").tci, "WS");
    trxState = {
        ready: false
    };
}).on('message', handleIncomingWsMessage);

const mqttClient = mqtt.connect(config.get("MQTT").uri, {
    reconnectPeriod: 5000,
    protocolVersion: 5,
}).on('connect', (connack) => {
    log.info('Connected to: ' + config.get("MQTT").uri + " " + JSON.stringify(connack), "MQTT");
    mqttClient.subscribe(TOPIC_SHARED_CONSUMER_PREFIX + TOPIC_EVENTS_TO_SDR_RAW);
    mqttClient.subscribe(TOPIC_SHARED_CONSUMER_PREFIX + TOPIC_EVENTS_TO_SDR_V2);
    mqttClient.subscribe(TOPIC_SHARED_CONSUMER_PREFIX + config.get("ratuV2").statusTopic);
    mqttClient.subscribe(config.get("ratuV2").configTopic);
    mqttClient.subscribe(TOPIC_SHARED_CONSUMER_PREFIX + TOPIC_ATU_V1_CMD);
}).on('error', (error) => {
    log.error(error.toString(), "MQTT");
}).on("reconnect", () => {
    log.warn("Reconnecting...", "MQTT");
}).on('message', handleIncomingMQTTMessage);

function testTopicPattern(topic, pattern) {
    return new RegExp(pattern.split `+`.join `[^/]+`.split `#`.join `.+`).test(topic);
}

function handleIncomingMQTTMessage(topic, message) {
    if (testTopicPattern(topic, TOPIC_ATU_V1_CMD)) {
        try {
            const cmd = JSON.parse(message.toString());
            if (typeof cmd["tune"] !== "undefined" && typeof activeDevice !== "undefined") {
                mqttClient.publish(ratuDevices[activeDevice].commandTopic, JSON.stringify({
                    cmd: "tune"
                }));
            }
        } catch (err) {
            log.error("ATU V1 command error: " + err, "V1");
        }
    } else if (testTopicPattern(topic, config.get("ratuV2").statusTopic)) {
        try {
            Object.getOwnPropertyNames(ratuDevices).forEach((d) => {
                if (ratuDevices[d].statusTopic === topic) {
                    activeDevice = d;
                }
            });
            ratuV2deserializer.deSerializeStatus(config.get("ratuV2").outputPrefix, JSON.parse(message.toString())).forEach(function (msg) {
                if (typeof msg.value !== "undefined") {
                    mqttClient.publish(msg.topic, String(msg.value));
                }
            })
        } catch (err) {
            log.error("ATU V1 status error: " + err, "V1");
        }
    } else if (testTopicPattern(topic, config.get("ratuV2").configTopic)) {
        try {
            const device = JSON.parse(message.toString());
            ratuDevices[device.device.id] = device;
            log.info("Discovered device: " + JSON.stringify(device), "DISCO");
        } catch {
            log.error("ATU V2 config error: " + err, "V1");
        }
    } else {
        if (wsClient.isConnected) {
            if (testTopicPattern(topic, TOPIC_EVENTS_TO_SDR_RAW)) {
                log.info(message.toString(), "RAW")
                wsClient.send(message.toString());
            }
            if (testTopicPattern(topic, TOPIC_EVENTS_TO_SDR_V2)) {
                try {
                    const msg = serializer.serialize(JSON.parse(message.toString()));
                    log.info(msg, "SER");
                    wsClient.send(msg);
                } catch (err) {
                    log.error("TCI serializer error: " + err, "SER");
                }
            }
        } else {
            log.warn(`wsClient is not connected, discarding: ${message.toString}`, "MQTT")
        }
    }
}

function handleIncomingWsMessage(message) {
    if (Buffer.isBuffer(message)) {
        let data = parser.parse(message, 'Stream');
        log.silly("Received audio stream: " +  JSON.stringify({
            receiver: data.receiver,
            sample_rate: data.sample_rate,
            length: data.length,
            type: data.type
        }), "RAW");
        //speaker.write(Buffer.of(new Int8Array((Float32Array.from(data.data.slice(data.length * 4)).buffer))));
        speaker.write(message.slice(16 * 4));
        return;
    }
    log.silly("Received: '" + message + "'", "RAW");
    mqttClient.publish(TOPIC_EVENTS_FROM_SDR_RAW, message);
    try {
        const event = deserializer.parse(message);
        const oldState = JSON.stringify(trxState);
        trxState = event.toState(trxState);
        mqttClient.publish(TOPIC_EVENTS_FROM_SDR, JSON.stringify(event));
        if (JSON.stringify(trxState) !== oldState) {
            mqttClient.publish(TOPIC_EVENTS_FROM_SDR_V2 + event.topic(), JSON.stringify(event), {
                retain: true
            });
            log.debug(TOPIC_EVENTS_FROM_SDR_V2 + event.topic() + " " + JSON.stringify(event), "WS");
            if (trxState.ready) {
                mqttClient.publish(TOPIC_SDR_STATE, JSON.stringify(trxState), {
                    retain: true
                });
                log.debug(TOPIC_SDR_STATE + "  " + JSON.stringify(trxState), "STATE");
            }
        }
    } catch (err) {
        if (!err.hasOwnProperty("location")) throw (err);
        log.silly("TCI parser error: " + err);
    }
}

async function start() {
    log.info("Starting up.");
    wsClient.start();
}

start();