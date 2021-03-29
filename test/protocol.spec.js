const assert = require('assert');
const peg = require("pegjs");
const fs = require('fs');
const parser = peg.generate(fs.readFileSync('protocol/tci.pegjs').toString());

describe('TCI protocol grammar test', () => {
    it('vfo:0,1,1223123;', () => {
        res = parser.parse("vfo:0,1,1223123;");
        assert.strictEqual(res.cmd, "vfo");
        assert.strictEqual(res.data.receiver, 0);
        assert.strictEqual(res.data.channel, 1);
        assert.strictEqual(res.data.freq, 1223123);
       });
    it('tx_power:10.5;', () => {
        res = parser.parse("tx_power:10.5;");
        assert.strictEqual(res.cmd, "tx_power");
        assert.strictEqual(res.data.tx_power, 10.5);
       });
    it('tx_swr:1.1;', () => {
        res = parser.parse("tx_swr:1.1;");
        assert.strictEqual(res.cmd, "tx_swr");
        assert.strictEqual(res.data.tx_swr, 1.1);
       });
    it('rx_smeter:0,1,-120;', () => {
        res = parser.parse("rx_smeter:0,1,-120;");
        assert.strictEqual(res.cmd, "rx_smeter");
        assert.strictEqual(res.data.receiver, 0);
        assert.strictEqual(res.data.channel, 1);
        assert.strictEqual(res.data.signal, -120);
       });
    it('rx_smeter:0,1;', () => {
        res = parser.parse("rx_smeter:0,1;");
        assert.strictEqual(res.cmd, "rx_smeter");
        assert.strictEqual(res.data.receiver, 0);
        assert.strictEqual(res.data.channel, 1);
       });
    });