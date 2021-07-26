function serialize(input) {
    switch (input.cmd) {
        case "tune": return `tune:${input.trx},${input.enabled};`;
        case "cw_msg": return `cw_msg:${input.trx},${input.pre_callsign},${input.callsign},${input.post_callsign};`;
        case "start": return `start;`;
        case "stop": return `stop;`;
        case "rx_smeter": return `rx_smeter:${input.trx},${input.channel};`;
        case "drive": if (input.trx) return `drive:${input.trx},${input.power};`; else return `drive:${input.power};`;
        case "tune_drive": if (input.trx) return `tune_drive:${input.trx},${input.power};`; else return `tune_drive:${input.power};`;
    }
    return null;
}

module.exports = {
    serialize: (input) => serialize(input)
};
