# Base image
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies (bao gồm cả devDependencies để chạy prisma generate)
RUN npm ci

# Sao chép thư mục prisma và sinh Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Sao chép toàn bộ mã nguồn còn lại
COPY . .

# Khai báo biến môi trường mặc định
ENV PORT=5000
ENV NODE_ENV=production

# Mở cổng 5000
EXPOSE 5000

# Khởi chạy ứng dụng
CMD ["npm", "start"]

#Test CI/CD pipeline