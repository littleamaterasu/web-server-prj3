const { Client } = require('@elastic/elasticsearch');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'search-logs-group' });

const client = new Client({
    node: 'https://172.30.34.103:9200',
    // node: 'localhost:9200',
    auth: {
        username: 'elastic',
        password: 'CsslKFJU2++JqoTGOv_v',
    },
    ssl: {
        rejectUnauthorized: false,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

const indexName = 'user-logs';
const batchSize = 1000;
let buffer = [];

// Kiểm tra và tạo index nếu chưa tồn tại
const ensureIndexExists = async () => {
    const indexExists = await client.indices.exists({ index: indexName });
    if (!indexExists.body) {
        await client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        userId: { type: 'keyword' },
                        keyword: { type: 'text' },
                        timestamp: { type: 'date' }
                    }
                }
            }
        });
        console.log(`Index '${indexName}' created.`);
    } else {
        console.log(`Index '${indexName}' already exists.`);
    }
};

// Function để import dữ liệu vào Elasticsearch
const importToES = async (docs) => {
    try {
        const result = await client.helpers.bulk({
            datasource: docs,
            onDocument: (doc) => ({ index: { _index: indexName, _id: `${doc.userId}-${doc.timestamp}` } }),
        });

        console.log(`Indexed batch with ${result.successful} documents, ${result.failed} failed.`);
    } catch (error) {
        console.error('Error importing documents to Elasticsearch:', error);
    }
};

// Consumer để nhận message và xử lý batch
const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'search-logs', fromBeginning: true });

    // Kiểm tra và tạo index nếu cần trước khi chạy consumer
    await ensureIndexExists();

    await consumer.run({
        eachMessage: async ({ message }) => {
            const data = JSON.parse(message.value.toString());
            buffer.push(data);

            // Nhập dữ liệu vào Elasticsearch theo batch
            if (buffer.length >= batchSize) {
                await importToES(buffer);
                buffer = []; // Xóa buffer sau khi bulk
            }
        },
    });

    // Xử lý các document còn lại khi kết thúc
    process.on('SIGINT', async () => {
        if (buffer.length > 0) {
            await importToES(buffer);
        }
        await consumer.disconnect();
        process.exit(0);
    });
};

// Xuất hàm chạy consumer
module.exports = { runConsumer };
