require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../generated/prisma/client.js');

// Cấu hình timezone mặc định cho ứng dụng là Asia/Ho_Chi_Minh (UTC+7)
process.env.TZ = process.env.TZ || 'Asia/Ho_Chi_Minh';

let connectionString = process.env.DATABASE_URL || '';

// Thêm timezone vào connection string nếu chưa có
if (!connectionString.includes('timezone=') && !connectionString.includes('TimeZone=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString = `${connectionString}${separator}timezone=Asia/Ho_Chi_Minh`;
}

const adapter = new PrismaPg({ connectionString });

// Cấu hình Prisma Client với timezone
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

module.exports = { prisma };
