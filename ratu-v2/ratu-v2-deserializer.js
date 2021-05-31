const jp = require('jsonpath');

function deSerializeStatus(prefix, input) {
    return [
        {
            topic: prefix + "/TuningStatus",
            value: jp.value(input, "$.atu.state")
        },
        {
            topic: prefix + "/mode",
            value: jp.value(input, "$.atu.mode")
        },
        {
            topic: prefix + "/rawFWD",
            value: jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.fwdRaw")
        },
        {
            topic: prefix + "/rawREF",
            value: jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.rflRaw")
        },
        {
            topic: prefix + "/fwdPwrVal",
            value: jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.fwd")
        },
        {
            topic: prefix + "/fwdPwrDisplay",
            value: Number(jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.fwd")).toFixed(2)
        },
        {
            topic: prefix + "/rflPwrVal",
            value: jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.rfl")
        },
        {
            topic: prefix + "/pwrdBmFWD",
            value: 10 * Math.log10(1000 * jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.rfl"))
        },
        {
            topic: prefix + "/valueSWR",
            value: jp.value(input, "$.sensor.SWRMeterAds1115Ad8310.swr")
        },
        {
            topic: prefix + "/c1actualStep",
            value: jp.value(input, "$.actuator.C1.value")
        },
        {
            topic: prefix + "/c2actualStep",
            value: jp.value(input, "$.actuator.C2.value")
        },
        {
            topic: prefix + "/lactualStep",
            value: jp.value(input, "$.actuator.L.value")
        },
        {
            topic: prefix + "/c1actualVal",
            value: jp.value(input, "$.actuator.C1.phValue")
        },
        {
            topic: prefix + "/c2actualVal",
            value: jp.value(input, "$.actuator.C2.phValue")
        },
        {
            topic: prefix + "/lactualVal",
            value: jp.value(input, "$.actuator.L.phValue")
        },
    ];

}

module.exports = {
    deSerializeStatus: (prefix, input) => deSerializeStatus(prefix, input)
};

