const kafka = require('kafka-node');

const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', function () {
    console.log('Kafka Producer for server 1 is ready');
});

producer.on('error', function (err) {
    console.error('Kafka Producer error:', err);
});

const sendLogToKafka = (logMessage, callback) => {
    const payloads = [
        { topic: 'search-logs', messages: JSON.stringify(logMessage), partition: 0 },
    ];

    producer.send(payloads, (err, data) => {
        callback(err, data);
    });
    callback(null, "b");
};

const search = (data, callback) => {
    const payloads = [
        { topic: 'search', messages: JSON.stringify(data) }
    ]

    producer.send(payloads, (err, data) => {
        callback(err, data);
    });
    callback(null, "b");
}

const getPersonalData = (data, callback) => {
    const payloads = [
        { topic: 'personal-data', messages: JSON.stringify(data) }
    ]

    producer.send(payloads, (err, data) => {
        callback(err, data);
    });
    callback(null, "b");
}

module.exports = {
    sendLogToKafka,
    search,
    getPersonalData
}