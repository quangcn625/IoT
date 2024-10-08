
const mqtt = require('mqtt');

const mqttClient = mqtt.connect('mqtt://192.168.42.102:1885', {
    username: 'legiaquang',
    password: 'b21dccn625',
});

module.exports = mqttClient;
