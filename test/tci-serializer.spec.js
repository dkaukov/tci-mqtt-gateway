const assert = require('assert');
const peg = require("pegjs");
const fs = require('fs');
const serializer = require("../protocol/tci-serializer");

describe('TCI serializer test', () => {
    it('tune', () => {
        assert.strictEqual("tune:1,true;", serializer.serialize({cmd: "tune", trx:1, enabled:true}));
    });   
    it('start', () => {
        assert.strictEqual("start;", serializer.serialize({cmd: "start"}));
    });   
    it('stop', () => {
        assert.strictEqual("stop;", serializer.serialize({cmd: "stop"}));
    });
    it('stop', () => {
        assert.strictEqual("stop;", serializer.serialize({cmd: "stop"}));
    });   
    it('rx_smeter', () => {
        assert.strictEqual("rx_smeter:1,1;", serializer.serialize({cmd: "rx_smeter", trx: 1, channel: 1}));
    });   
    it('drive', () => {
        assert.strictEqual("drive:10;", serializer.serialize({cmd: "drive", power: 10}));
    });   
    it('tune_drive', () => {
        assert.strictEqual("tune_drive:10;", serializer.serialize({cmd: "tune_drive", power: 10}));
    });   
    it('cw_msg', () => {
        assert.strictEqual("cw_msg:1,hello,FKN72,word;", serializer.serialize({cmd: "cw_msg", trx: 1, pre_callsign: "hello", callsign: "FKN72", post_callsign: "word"}));
    });   
})