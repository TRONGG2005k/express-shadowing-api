/**
 * Cấu hình JWT và Authentication
 */
const authConfig = {
    // JWT Secrets
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },
    
    // Cookie settings
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    
    // Bcrypt settings
    bcrypt: {
        saltRounds: 10
    }
};

module.exports = authConfig;
