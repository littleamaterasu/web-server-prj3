const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'https://172.30.34.103:9200',
    auth: {
        username: 'elastic', // Tên người dùng
        password: 'CsslKFJU2++JqoTGOv_v',  // Mật khẩu
    },
    ssl: {
        rejectUnauthorized: false, // Customize SSL if needed
    },
    tls: {
        rejectUnauthorized: false, // Bypass SSL verification
    }
});

// Tên chỉ mục
// 1
// 2 
const indexName = 'my-vi-index-00003';

const createIndex = async (indexName) => {
    try {
        const response = await client.indices.create({
            index: indexName,
            body: {
                settings: {
                    analysis: {
                        analyzer: {
                            my_vi_analyzer: {
                                type: "vi_analyzer",
                                filter: [
                                    "lowercase",
                                    "my_stopwords"
                                ]
                            }
                        },
                        filter: {
                            my_stopwords: {
                                type: "stop",
                                stopwords: [
                                    "_none_", // Nếu bạn muốn từ dừng mặc định của Elasticsearch
                                    "rất",
                                    "những",
                                    "và",
                                    "là",
                                    "của",
                                    "để",
                                    "trong",
                                    "tại",
                                    "cho",
                                    "có",
                                    "không",
                                    "như",
                                    "một",
                                    "các",
                                    "thì",
                                    "này",
                                    "đã",
                                    "sẽ",
                                    "về",
                                    "cũng",
                                    "từ",
                                    "thế",
                                    "vì",
                                    "khi",
                                    "và",
                                    "mà",
                                    "với"
                                ]
                            }
                        }
                    }
                }
            }
        });
        console.log('Chỉ mục đã được tạo:', response);
    } catch (error) {
        console.error('Lỗi tạo chỉ mục:', error);
    }
};

// Hàm phân tích văn bản sử dụng analyzer tùy chỉnh
const analyzeText = async (indexName, text) => {
    try {
        const response = await client.indices.analyze({
            index: indexName,
            body: {
                analyzer: 'my_vi_analyzer',
                text: text,
            },
        });
        response.tokens.forEach(element => {
            console.log(element.token)
        });
    } catch (error) {
        console.error('Lỗi phân tích:', error);
    }
};

// Chạy hàm tạo chỉ mục và phân tích văn bản
const run = async () => {
    const textToAnalyze = "Bộ trưởng khẳng định các cơ quan, doanh nghiệp nước này sẵn sàng thảo luận với phía Việt Nam để đẩy tiến độ đàm phán, thống nhất các văn kiện hợp tác, triển khai các dự án, trong đó có xây dựng trung tâm dự trữ, phân phối các sản phẩm dầu khí. Arab Saudi là đối tác thương mại lớn thứ ba của Việt Nam tại khu vực Trung Đông - Bắc Phi với kim ngạch thương mại song phương năm 2023 đạt 2,68 tỷ USD, 9 tháng đầu năm đạt 2,21 tỷ USD. Tính đến tháng 9, Arab Saudi đứng thứ 79/148 quốc gia và vùng lãnh thổ đầu tư vào Việt Nam với 8 dự án, tổng vốn đăng ký là 8,57 triệu USD. Hiện có khoảng 4.000 lao động Việt Nam tại nước này. Tại cuộc gặp, Thủ tướng Phạm Minh Chính khẳng định Việt Nam coi trọng việc mở rộng quan hệ hợp tác đầu tư với khu vực Trung Đông, trong đó Arab Saudi là một trong những trọng tâm hàng đầu. Ông cam kết phía Việt Nam sẽ hành động nhanh, đáp ứng kịp thời hơn yêu cầu của các nhà đầu tư. Thủ tướng cũng mời Bộ trưởng và các doanh nghiệp Arab Saudi sang thăm, làm việc tại Việt Nam để triển khai các dự án hợp tác cụ thể. Cùng đó, ông cho biết sẽ giao lãnh đạo Bộ Kế hoạch và Đầu tư dự hội nghị xúc tiến đầu tư của Arab Saudi trong thời gian tới. Ngoài ra, lãnh đạo Việt Nam đề nghị Bộ trưởng Đầu tư Arab Saudi quan tâm thúc đẩy đàm phán nhanh hiệp định bảo hộ đầu tư giữa hai nước; trao đổi kinh nghiệm tạo môi trường đầu tư kinh doanh thuận lợi, bình đẳng, hấp dẫn... Ông cũng đề xuất phía Arab Saudi sớm thống nhất với Bộ Kế hoạch và Đầu tư Việt Nam nội dung biên bản ghi nhớ hợp tác về đầu tư trực tiếp và cụ thể hóa các nội dung bằng kế hoạch hành động, đưa ra các mục tiêu cụ thể để thúc đẩy quan hệ đầu tư giữa hai nước trong thời gian tới.";
    await analyzeText(indexName, textToAnalyze);
};

run();



