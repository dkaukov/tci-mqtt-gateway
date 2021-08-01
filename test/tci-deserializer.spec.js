const assert = require('assert');
const peg = require("pegjs");
const fs = require('fs');
const parser = peg.generate(fs.readFileSync('protocol/tci-deserializer.pegjs').toString());

describe('TCI deserializer test', () => {
    it('vfo:0,1,1223123;', () => {
        res = parser.parse("vfo:0,1,1223123;");
        assert.strictEqual(res.cmd, "vfo");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.channel, 1);
        assert.strictEqual(res.data.freq, 1223123);
        assert.strictEqual(res.topic(), "vfo/0/1");
        state = res.toState({});
        assert.strictEqual(state.trx[0].ch[1].freq, 1223123);
    });
    it('tx_power:10.5;', () => {
        res = parser.parse("tx_power:10.5;");
        assert.strictEqual(res.cmd, "tx_power");
        assert.strictEqual(res.data.power, 10.5);
        assert.strictEqual(res.topic(), "tx_power");
        state = res.toState({});
        assert.strictEqual(state.tx_power, 10.5);
    });
    it('tx_swr:1.1;', () => {
        res = parser.parse("tx_swr:1.1;");
        assert.strictEqual(res.cmd, "tx_swr");
        assert.strictEqual(res.data.swr, 1.1);
        assert.strictEqual(res.topic(), "tx_swr");
        state = res.toState({});
        assert.strictEqual(state.tx_swr, 1.1);
    });
    it('rx_smeter:0,1,-120;', () => {
        res = parser.parse("rx_smeter:0,1,-120;");
        assert.strictEqual(res.cmd, "rx_smeter");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.channel, 1);
        assert.strictEqual(res.data.signal, -120);
        assert.strictEqual(res.topic(), "rx_smeter/0/1");
        state = res.toState({});
        assert.strictEqual(state.trx[0].ch[1].signal, -120);
    });
    it('tune:1,true;', () => {
        res = parser.parse("tune:1,true;");
        assert.strictEqual(res.cmd, "tune");
        assert.strictEqual(res.data.trx, 1);
        assert.strictEqual(res.data.enabled, true);
        assert.strictEqual(res.topic(), "tune/1");
        state = res.toState({});
        assert.strictEqual(state.trx[1].tune, true);
    });
    it('tune_drive:25;', () => {
        res = parser.parse("tune_drive:25;");
        assert.strictEqual(res.cmd, "tune_drive");
        assert.strictEqual(res.topic(), "tune_drive");
        state = res.toState({});
        assert.strictEqual(state.tune_power_pct, 25);
    });
    it('drive:25;', () => {
        res = parser.parse("drive:25;");
        assert.strictEqual(res.cmd, "drive");
        assert.strictEqual(res.topic(), "drive");
        state = res.toState({});
        assert.strictEqual(state.tx_power_pct, 25);
    });
    it('tune_drive:1,25;', () => {
        res = parser.parse("tune_drive:1,25;");
        assert.strictEqual(res.cmd, "tune_drive");
        assert.strictEqual(res.data.trx, 1);
        assert.strictEqual(res.topic(), "tune_drive/1");
        state = res.toState({});
        assert.strictEqual(state.trx[1].tune_power_pct, 25);
    });
    it('drive:1,25;', () => {
        res = parser.parse("drive:1,25;");
        assert.strictEqual(res.cmd, "drive");
        assert.strictEqual(res.data.trx, 1);
        assert.strictEqual(res.topic(), "drive/1");
        state = res.toState({});
        assert.strictEqual(state.trx[1].tx_power_pct, 25);
    });
    it('trx:1,true;', () => {
        res = parser.parse("trx:1,true;");
        assert.strictEqual(res.cmd, "trx");
        assert.strictEqual(res.data.trx, 1);
        assert.strictEqual(res.data.enabled, true);
        assert.strictEqual(res.topic(), "trx/1");
        state = res.toState({});
        assert.strictEqual(state.trx[1].active, true);
    });
    it('modulation:0,ccb;', () => {
        res = parser.parse("modulation:0,ccb;");
        assert.strictEqual(res.cmd, "modulation");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.mode, "ccb");
        assert.strictEqual(res.topic(), "modulation/0");
        state = res.toState({});
        assert.strictEqual(state.trx[0].mode, "ccb");
    });
    it('ready;', () => {
        res = parser.parse("ready;");
        assert.strictEqual(res.cmd, "ready");
        assert.strictEqual(res.data.ready, true);
        assert.strictEqual(res.topic(), "ready");
        state = res.toState({});
        assert.strictEqual(state.ready, true);
    });
    it('protocol:esdr,1.4; ', () => {
        res = parser.parse("protocol:esdr,1.4;");
        assert.strictEqual(res.cmd, "protocol");
        assert.strictEqual(res.data.type, "esdr");
        assert.strictEqual(res.data.version, "1.4");
        assert.strictEqual(res.topic(), "protocol");
        state = res.toState({});
        assert.strictEqual(state.protocol.type, "esdr");
        assert.strictEqual(state.protocol.version, "1.4");
    });
    it('tx_enable:0,true;', () => {
        res = parser.parse("tx_enable:0,true;");
        assert.strictEqual(res.cmd, "tx_enable");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.enabled, true);
        assert.strictEqual(res.topic(), "tx_enable/0");
        state = res.toState({});
        assert.strictEqual(state.trx[0].tx_enabled, true);
    });
    it('rx_enable:0,true;', () => {
        res = parser.parse("rx_enable:0,true;");
        assert.strictEqual(res.cmd, "rx_enable");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.enabled, true);
        assert.strictEqual(res.topic(), "rx_enable/0");
        state = res.toState({});
        assert.strictEqual(state.trx[0].rx_enabled, true);
    });
    it('rx_mute:0,true;', () => {
        res = parser.parse("rx_mute:0,true;");
        assert.strictEqual(res.cmd, "rx_mute");
        assert.strictEqual(res.data.trx, 0);
        assert.strictEqual(res.data.mute, true);
        assert.strictEqual(res.topic(), "rx_mute/0");
        state = res.toState({});
        assert.strictEqual(state.trx[0].mute, true);
    });
});
