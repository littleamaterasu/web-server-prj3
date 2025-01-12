const express = require('express');
const http = require('http');
const producerService = require('./service/producer'); ``
const consumerService = require('./service/consumer');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

app.use(cors({
    origin: '*', // Địa chỉ của frontend
    methods: ['GET', 'POST'], // Các phương thức cho phép
    credentials: true // Nếu bạn cần gửi cookie
}));

let jobId = 0;

// tìm kiếm
app.post('/search', async (req, res) => {
    ++jobId;
    console.log("job ID", jobId, req.body);
    const searchKeyword = req.body.keyword;

    // kiểm tra cookie
    let userId = req.cookies.userId;
    console.log("userId", userId, "from cookies", req.cookies);

    // Tạo cookie
    if (!userId) {
        userId = generateUniqueId();
        res.cookie('userId', userId, { maxAge: 10000 * 60 * 60 * 24 * 365 * 10 }); // Set the cookie
    }

    if (!searchKeyword) {
        return res.status(400).send('Missing search keyword');
    }

    // Gửi tới consumer tại es để tìm dữ liệu
    const dto = {
        jobId: jobId,
        uid: userId,
        keywords: searchKeyword,
        from: req.body.from,
        to: req.body.to,
    };
    console.log(dto);
    producerService.search(dto, (err, result) => {
        if (err) {
            console.error('Failed to send log to Kafka:', err);
            return res.status(500).send('Failed to send log');
        }
    })

    // Đợi data gửi về
    try {
        const data = await consumerService.waitForJobId(jobId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});


// lấy sở thích người dùng
app.post('/personal', async (req, res) => {
    ++jobId;
    console.log("job ID", jobId, req.body);

    // Check for userId in cookies
    let userId = req.cookies.userId;
    console.log("userId", userId, "from cookies", req.cookies);

    // If userId is not present, create a new cookie
    if (!userId) {
        userId = generateUniqueId(); // Create a new unique ID for the user
        res.cookie('userId', userId, { maxAge: 10000 * 60 * 60 * 24 * 365 * 10 }); // Set the cookie
    }

    const data = {
        jobId: jobId,
        uid: userId
    }

    producerService.getPreference(data, (err, result) => {
        if (err) {
            console.error('Failed to send log to Kafka:', err);
            return res.status(500).send('Failed to send log');
        }
    });

    // Đợi data gửi về
    try {
        const data = await consumerService.waitForJobId(jobId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// Function to generate a unique user ID (this is just an example)
function generateUniqueId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

consumerService.startConsumer().catch(console.error);

server.listen(3010, () => {
    console.log('Server is running on http://localhost:3010');
});
