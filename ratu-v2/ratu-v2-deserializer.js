const {JSONPath} = require('jsonpath-plus');

function deSerializeStatus(prefix, input) {
    return [
        {
            topic: prefix + "/TuningStatus",
            value: JSONPath("$.atu.state", input)
        },
        {
            topic: prefix + "/mode",
            value: JSONPath("$.atu.mode", input)
        },
        {
            topic: prefix + "/rawFWD",
            value: JSONPath("$.sensor.SWRMeterAds1115Ad8310.fwdRaw", input)
        },
        {
            topic: prefix + "/rawREF",
            value: JSONPath("$.sensor.SWRMeterAds1115Ad8310.rflRaw", input)
        },
        {
            topic: prefix + "/fwdPwrVal",
            value: JSONPath("$.sensor.SWRMeterAds1115Ad8310.fwd", input)
        },
        {
            topic: prefix + "/fwdPwrDisplay",
            value: Number(JSONPath("$.sensor.SWRMeterAds1115Ad8310.fwd"), input).toFixed(2)
        },
        {
            topic: prefix + "/rflPwrVal",
            value: JSONPath("$.sensor.SWRMeterAds1115Ad8310.rfl", input)
        },
        {
            topic: prefix + "/pwrdBmFWD",
            value: 10 * Math.log10(1000 * JSONPath("$.sensor.SWRMeterAds1115Ad8310.rfl", input))
        },
        {
            topic: prefix + "/valueSWR",
            value: JSONPath("$.sensor.SWRMeterAds1115Ad8310.swr", input)
        },
        {
            topic: prefix + "/c1actualStep",
            value: JSONPath("$.actuator.C1.value", input)
        },
        {
            topic: prefix + "/c2actualStep",
            value: JSONPath("$.actuator.C2.value", input)
        },
        {
            topic: prefix + "/lactualStep",
            value: JSONPath("$.actuator.L.value", input)
        },
        {
            topic: prefix + "/c1actualVal",
            value: JSONPath("$.actuator.C1.phValue", input)
        },
        {
            topic: prefix + "/c2actualVal",
            value: JSONPath("$.actuator.C2.phValue", input)
        },
        {
            topic: prefix + "/lactualVal",
            value: JSONPath("$.actuator.L.phValue", input)
        },
    ];

}

module.exports = {
    deSerializeStatus: (prefix, input) => deSerializeStatus(prefix, input)
};

