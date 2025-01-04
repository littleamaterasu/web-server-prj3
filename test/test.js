const axios = require('axios');

// Mảng chứa 10 mã chứng khoán
const stockCodes = Array.from({ length: 100 }, (_, index) => {
    const prefix = 'STK'; // Tiền tố cho mã chứng khoán
    const codeNumber = String(index + 1).padStart(4, '0'); // Đảm bảo mã có 4 chữ số
    return `${prefix}${codeNumber}`;
});

// Hàm gửi một yêu cầu POST đến load balancer
async function sendRequest(keyword, userId) {
    try {
        const response = await axios.post('http://localhost:3010/search', {
            keyword: keyword,
            userId: userId
        });
        console.log('Response:', response.status, response.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Hàm gửi 100 yêu cầu
async function sendMultipleRequests() {
    const requests = [];
    let successCount = 0; // Count of successful requests
    let errorCount = 0; // Count of errors

    for (let i = 0; i < 1000; i++) {
        const userId = Math.floor(Math.random() * 50); // Ngẫu nhiên ID người dùng
        const index = Math.random() > 0.75 ? userId % stockCodes.length : Math.floor(Math.random() * stockCodes.length);
        const keyword = stockCodes[index]; // Lấy từ khóa từ mảng mã chứng khoán

        // Push the request and handle success/error using a .then() and .catch()
        requests.push(
            sendRequest(keyword, userId)
                .then(() => {
                    successCount++; // Increment success count
                })
                .catch((error) => {
                    console.error(`Error sending request for userId ${userId} and keyword ${keyword}:`, error);
                    errorCount++; // Increment error count
                })
        );
    }

    // Wait for all requests to complete
    await Promise.all(requests);

    // Log the counts of successful and erroneous requests
    console.log(`Completed sending 10000 requests`);
    console.log(`Successfully sent: ${successCount}`);
    console.log(`Errors encountered: ${errorCount}`);
}


// Gửi yêu cầu mỗi 3 giây
//const intervalId = setInterval(() => {
    sendMultipleRequests();
//}, 3000);

// Dừng gửi yêu cầu sau 1 phút (60000ms) - Tùy chọn
//setTimeout(() => {
//    clearInterval(intervalId);
//    console.log('Stopped sending requests after 1 minute');
//}, 60000);
