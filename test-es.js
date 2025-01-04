const { Client } = require('@elastic/elasticsearch');

// Khởi tạo client Elasticsearch
const client = new Client({
    node: 'http://172.30.34.103:9200', // URL của Elasticsearch
});

var totalDocs = 0;

// Hàm thực hiện truy vấn term vector cho một tài liệu
async function getTermVector(index, docId, field) {
    try {
        // Gửi yêu cầu term vector tới Elasticsearch
        const response = await client.termvectors({
            index: index,    // Chỉ mục bạn muốn tìm
            id: docId,       // ID của tài liệu
            body: {
                fields: [field],       // Trường bạn muốn lấy term vector (ví dụ "logs")
                term_statistics: true, // Lấy thống kê về các từ
                positions: true,       // Lấy vị trí của các từ
                offsets: true,         // Lấy thông tin về độ dài từ
            },
        });

        return response.term_vectors[field];
    } catch (error) {
        console.error('Error fetching term vector for docId ' + docId + ':', error);
    }
}

// Hàm lấy các tài liệu từ index
async function getDocuments(index) {
    try {
        const response = await client.search({
            index: index,
            size: 100, // Bạn có thể điều chỉnh kích thước tùy vào số lượng tài liệu
            body: {
                query: {
                    match_all: {} // Lấy tất cả tài liệu
                },
            },
        });
        totalDocs = response.hits.total.value;
        return response.hits.hits;
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}

// Hàm trích xuất từ có TF-IDF cao nhất từ term vector
function getTopTermsFromTermVector(termVector) {
    const terms = termVector;
    // console.log(terms)
    // const termTFIDF = terms.map(token => ({
    //     term: token,
    //     tfidf: token.term_freq * token.idf, // Tính TF-IDF: term_freq * idf
    // }));

    const termTFIDF = [];
    for (const term in terms) {
        const idf = Math.log(totalDocs * 1.0 / terms[term].doc_freq);
        termTFIDF.push({
            term: term,
            tfidf: terms[term].term_freq * idf
        })
    }

    // Sắp xếp theo TF-IDF giảm dần và lấy 5 từ có TF-IDF cao nhất
    return termTFIDF.sort((a, b) => b.tfidf - a.tfidf);
}

// Hàm lấy từ có TF-IDF cao nhất của tất cả các tài liệu trong index
async function getTopTermsForAllDocuments(index, field) {
    const documents = await getDocuments(index);
    for (const doc of documents) {
        const docId = doc._id;
        const termVector = await getTermVector(index, docId, field);
        // console.log("term vector:", termVector)

        if (termVector) {
            const topTerms = getTopTermsFromTermVector(termVector.terms);
            console.log(`Top terms for docId ${docId}:`);
            topTerms.forEach((term, index) => {
                console.log(`${index + 1}. Term: ${term.term}, TF-IDF: ${term.tfidf}`);
            });
            console.log('-----------------------------');
        }
    }
}

// Thực thi hàm với các tham số
const index = 'news_index';  // Chỉ mục cần tìm
const field = 'description'; // Trường cần lấy term vector

getTopTermsForAllDocuments(index, field);
