# Sử dụng image Node.js chính thức
FROM node:latest

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 3010
EXPOSE 3010

# Lệnh để chạy ứng dụng
CMD ["node", "server.js"]
