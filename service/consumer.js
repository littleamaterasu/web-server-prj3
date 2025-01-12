const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: 'my-consumer',
    brokers: process.env.KAFKA_HOST.split(','),
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
const pendingJobs = new Map(); // Map lưu các Promise đang chờ

async function startConsumer() {
    await consumer.connect();

    // test
    // await consumer.subscribe({ topic: 'search', fromBeginning: true });

    // actual response
    await consumer.subscribe({ topic: 'api-res', fromBeginning: true });

    console.log('Consumer started.');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log('received message', partition)
            const value = message.value.toString();
            try {
                const data = JSON.parse(value); // Giả định message là JSON
                const { jobId } = data;

                if (jobId && pendingJobs.has(jobId)) {
                    // Resolve promise cho jobId đang chờ
                    pendingJobs.get(jobId).resolve(data);
                    pendingJobs.delete(jobId); // Xóa jobId khỏi danh sách chờ
                }
            } catch (err) {
                console.error(`Failed to process message: ${value}`, err);
            }
        },
    });
}

// API xử lý request
function waitForJobId(jobId) {
    return new Promise((resolve, reject) => {
        if (pendingJobs.has(jobId)) {
            reject(new Error(`JobId ${jobId} is already being processed.`));
            return;
        }

        // Lưu Promise vào Map
        pendingJobs.set(jobId, { resolve, reject });

        // Timeout để tránh chờ mãi mãi nếu không có message nào tới
        setTimeout(() => {
            if (pendingJobs.has(jobId)) {
                pendingJobs.get(jobId).reject(new Error(`Timeout waiting for jobId: ${jobId}`));
                pendingJobs.delete(jobId);
            }
        }, 5000); // Timeout sau 5 giây (có thể tùy chỉnh)
    });
}

module.exports = { startConsumer, waitForJobId };
