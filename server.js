const express = require('express');
const http = require('http');
const logsService = require('./service/producer'); ``
const consumerService = require('./service/consumer');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

app.use(cors({
    origin: 'http://192.168.100.1:5173', // Địa chỉ của frontend
    methods: ['GET', 'POST'], // Các phương thức cho phép
    credentials: true // Nếu bạn cần gửi cookie
}));

// API endpoint để ghi lại từ khóa tìm kiếm
app.post('/search', (req, res) => {
    console.log(req.body);
    const searchKeyword = req.body.keyword;

    // Check for userId in cookies
    let userId = req.cookies.userId;
    console.log("userId", userId, "from cookies", req.cookies);

    // If userId is not present, create a new cookie
    if (!userId) {
        userId = generateUniqueId(); // Create a new unique ID for the user
        res.cookie('userId', userId, { maxAge: 10000 * 60 * 60 * 24 * 365 * 10 }); // Set the cookie
    }

    if (!searchKeyword) {
        return res.status(400).send('Missing search keyword');
    }

    // Ghi log từ khóa tìm kiếm
    const logMessage = {
        userId: userId,
        timestamp: new Date().toISOString(),
        keyword: searchKeyword,
        cookie: req.cookies,
    };

    // Gửi log tới logs service
    logsService.sendLogToKafka(logMessage, (err, result) => {
        if (err) {
            console.error('Failed to send log to Kafka:', err);
            return res.status(500).send('Failed to send log');
        }
    });
    res.status(200).send(logMessage);
});

// Function to generate a unique user ID (this is just an example)
function generateUniqueId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

consumerService.runConsumer().catch(console.error);

server.listen(3010, () => {
    console.log('Server is running on http://localhost:3010');
});
