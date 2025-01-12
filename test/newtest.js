const axios = require('axios');

// Endpoint URL
const url = 'http://localhost:3010/search';

// Số lượng request
const numRequests = 100;

// Hàm gửi request
async function sendRequest() {
    // Tạo keyword là một chữ cái ngẫu nhiên
    const keyword = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Chữ cái ngẫu nhiên từ 'a' đến 'z'
    const body = { keyword };

    try {
        const response = await axios.post(url, body);
        return `Status: ${response.status}`;
    } catch (error) {
        return `Error: ${error.response ? error.response.status : error.message}`;
    }
}

// Hàm gửi đồng thời các request
async function testConcurrentRequests() {
    const requests = [];

    for (let i = 0; i < numRequests; i++) {
        requests.push(sendRequest());
    }

    // Dùng Promise.all để chờ tất cả các request hoàn thành
    const results = await Promise.all(requests);

    // In kết quả từng request
    results.forEach((result, index) => {
        console.log(`Request ${index + 1}: ${result}`);
    });
}

// Chạy thử nghiệm
testConcurrentRequests();
