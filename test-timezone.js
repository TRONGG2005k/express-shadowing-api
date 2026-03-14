/**
 * Script kiểm thử timezone cho database
 * Kiểm tra việc lưu và đọc dữ liệu DateTime với giờ Việt Nam (Asia/Saigon, UTC+7)
 */

require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma/client.js');

// Cấu hình timezone cho toàn bộ ứng dụng
process.env.TZ = 'Asia/Ho_Chi_Minh';

const connectionString = process.env.DATABASE_URL || '';

// Thêm timezone vào connection string nếu chưa có
let connectionStringWithTimezone = connectionString;
if (!connectionString.includes('timezone=') && !connectionString.includes('TimeZone=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionStringWithTimezone = `${connectionString}${separator}timezone=Asia/Ho_Chi_Minh`;
}

console.log('========================================');
console.log('KIỂM THỬ TIMEZONE - GIỜ VIỆT NAM (UTC+7)');
console.log('========================================\n');

// Thông tin timezone hệ thống
console.log('1. THÔNG TIN TIMEZONE HỆ THỐNG:');
console.log('   - process.env.TZ:', process.env.TZ);
console.log('   - Date().toString():', new Date().toString());
console.log('   - Intl.DateTimeFormat().resolvedOptions().timeZone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('   - Thờ gian hiện tại (local):', new Date().toLocaleString('vi-VN'));
console.log('   - Thờ gian hiện tại (ISO):', new Date().toISOString());
console.log();

const adapter = new PrismaPg({ connectionString: connectionStringWithTimezone });
const prisma = new PrismaClient({ adapter });

async function testTimezone() {
    try {
        // Tìm user hợp lệ để test
        console.log('2. TÌM USER HỢP LỆ:');
        const firstUser = await prisma.users.findFirst();
        if (!firstUser) {
            console.log('   ⚠️ Không tìm thấy user nào trong database. Kiểm tra timezone qua raw query.');
        } else {
            console.log('   - User ID sử dụng:', firstUser.id);
        }
        console.log();

        // Test 1: Tạo bản ghi mới và kiểm tra thờ gian lưu
        console.log('3. KIỂM TRA TẠO BẢN GHI MỚI:');

        const now = new Date();
        console.log('   - Thờ gian trước khi lưu (local):', now.toLocaleString('vi-VN'));
        console.log('   - Thờ gian trước khi lưu (ISO):', now.toISOString());

        let testData;
        if (firstUser) {
            // Tạo một vocabulary mới để test
            testData = await prisma.vocabulary.create({
                data: {
                    word: `test_timezone_${Date.now()}`,
                    type: 'noun',
                    meaning_vi: 'Test timezone',
                    created_by: firstUser.id,
                    created_at: now,
                    updated_at: now
                }
            });

            console.log('   - ID bản ghi tạo:', testData.id);
            console.log('   - created_at từ DB:', testData.created_at);
            console.log('   - created_at (local):', testData.created_at?.toLocaleString('vi-VN'));
            console.log();

            // Test 2: Đọc lại bản ghi từ DB
            console.log('4. KIỂM TRA ĐỌC BẢN GHI TỪ DB:');
            const readData = await prisma.vocabulary.findUnique({
                where: { id: testData.id }
            });

            console.log('   - created_at đọc từ DB:', readData.created_at);
            console.log('   - created_at chuyển local:', readData.created_at?.toLocaleString('vi-VN'));
            console.log('   - updated_at đọc từ DB:', readData.updated_at);
            console.log('   - updated_at chuyển local:', readData.updated_at?.toLocaleString('vi-VN'));
        }
        console.log();

        // Test 3: Kiểm tra NOW() của PostgreSQL
        console.log('5. KIỂM TRA NOW() CỦA POSTGRESQL:');
        const dbNowResult = await prisma.$queryRaw`SELECT NOW() as db_now, CURRENT_TIMESTAMP as current_ts`;
        console.log('   - NOW() từ DB:', dbNowResult[0].db_now);
        console.log('   - CURRENT_TIMESTAMP từ DB:', dbNowResult[0].current_ts);
        console.log('   - NOW() (local):', new Date(dbNowResult[0].db_now).toLocaleString('vi-VN'));
        console.log();

        // Test 4: Kiểm tra timezone của database
        console.log('6. KIỂM TRA TIMEZONE CỦA DATABASE:');
        const timezoneResult = await prisma.$queryRaw`SHOW timezone`;
        console.log('   - Timezone setting:', timezoneResult[0].TimeZone);

        const offsetResult = await prisma.$queryRaw`SELECT EXTRACT(TIMEZONE FROM NOW())/3600 as offset_hours`;
        console.log('   - Offset từ UTC (giờ):', offsetResult[0].offset_hours);
        console.log();

        // Test 5: So sánh thờ gian
        console.log('7. SO SÁNH THỜI GIAN:');
        const jsNow = new Date();
        const dbNow = new Date(dbNowResult[0].db_now);
        const diffMs = Math.abs(jsNow.getTime() - dbNow.getTime());

        console.log('   - JavaScript Date():', jsNow.toLocaleString('vi-VN'));
        console.log('   - PostgreSQL NOW():', dbNow.toLocaleString('vi-VN'));
        console.log('   - Chênh lệch (ms):', diffMs);
        console.log('   - Kết quả:', diffMs < 5000 ? '✅ PASS - Chênh lệch < 5 giây' : '❌ FAIL - Chênh lệch quá lớn');
        console.log();

        // Test 6: Kiểm tra DEFAULT NOW()
        console.log('8. KIỂM TRA DEFAULT NOW():');
        let autoRecord;
        if (firstUser) {
            autoRecord = await prisma.vocabulary.create({
                data: {
                    word: `test_auto_${Date.now()}`,
                    type: 'verb',
                    meaning_vi: 'Test auto timestamp',
                    created_by: firstUser.id
                    // Không truyền created_at, để DB tự động gán DEFAULT NOW()
                }
            });
            console.log('   - ID bản ghi:', autoRecord.id);
            console.log('   - created_at (DB default):', autoRecord.created_at?.toLocaleString('vi-VN'));
            console.log('   - Thờ gian hiện tại:', new Date().toLocaleString('vi-VN'));

            const autoDiff = Math.abs(new Date().getTime() - (autoRecord.created_at?.getTime() || 0));
            console.log('   - Chênh lệch (ms):', autoDiff);
            console.log('   - Kết quả:', autoDiff < 5000 ? '✅ PASS - DEFAULT NOW() hoạt động đúng' : '⚠️ WARNING - Có thể có vấn đề về timezone');
        } else {
            console.log('   - Bỏ qua (không có user để test)');
        }
        console.log();

        // Cleanup: Xóa các bản ghi test
        console.log('9. DỌN DẸP:');
        if (firstUser && testData && autoRecord) {
            await prisma.vocabulary.deleteMany({
                where: {
                    id: { in: [testData.id, autoRecord.id] }
                }
            });
            console.log('   - Đã xóa các bản ghi test');
        } else {
            console.log('   - Không có bản ghi nào cần xóa');
        }
        console.log();

        // Kết luận
        console.log('========================================');
        console.log('KẾT LUẬN:');
        console.log('========================================');
        const isTimezoneCorrect = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Ho_Chi_Minh';
        const isDbTimeClose = diffMs < 5000;

        if (isTimezoneCorrect && isDbTimeClose) {
            console.log('✅ Cấu hình timezone đúng - Dữ liệu sẽ lưu với giờ Việt Nam (UTC+7)');
        } else {
            console.log('⚠️ Cần kiểm tra lại cấu hình timezone');
            if (!isTimezoneCorrect) console.log('   - Timezone hệ thống không phải Asia/Ho_Chi_Minh');
            if (!isDbTimeClose) console.log('   - Thờ gian DB và hệ thống không đồng bộ');
        }
        console.log();

    } catch (error) {
        console.error('❌ LỖI KIỂM THỬ:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testTimezone();
