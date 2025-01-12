const kafka = require('kafka-node');
require('dotenv').config();

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const producer = new kafka.Producer(client);

producer.on('ready', function () {
    console.log('Kafka Producer for server 1 is ready');
});

producer.on('error', function (err) {
    console.error('Kafka Producer error:', err);
});

const search = (data, callback) => {
    const payloads = [
        { topic: 'search', messages: JSON.stringify(data) }
    ]

    producer.send(payloads, (err, data) => {
        callback(err, data);
    });
    callback(null, "b");
}

const getPreference = (data, callback) => {
    const payloads = [
        { topic: 'preference', messages: JSON.stringify(data) }
    ]

    producer.send(payloads, (err, data) => {
        callback(err, data);
    });
    callback(null, "b");
}

module.exports = {
    search,
    getPreference
}