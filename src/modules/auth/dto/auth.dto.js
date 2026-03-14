const { z } = require('zod');

/**
 * DTO cho đăng ký
 */
const RegisterDto = z.object({
    username: z.string()
        .min(1, 'Tên ngưởi dùng không được để trống')
        .max(100, 'Tên ngưởi dùng không được quá 100 ký tự'),
    phone: z.string()
        .min(1, 'Số điện thoại không được để trống')
        .max(20, 'Số điện thoại không được quá 20 ký tự')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
    password: z.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(255, 'Mật khẩu không được quá 255 ký tự'),
    role: z.enum(['student', 'teacher', 'admin']).default('student')
});

/**
 * DTO cho đăng nhập
 */
const LoginDto = z.object({
    phone: z.string()
        .min(1, 'Số điện thoại không được để trống')
        .max(20, 'Số điện thoại không được quá 20 ký tự')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
    password: z.string()
        .min(1, 'Mật khẩu không được để trống')
        .max(255, 'Mật khẩu không được quá 255 ký tự')
});

/**
 * DTO cho refresh token
 */
const RefreshTokenDto = z.object({
    refreshToken: z.string()
        .min(1, 'Refresh token không được để trống')
});

/**
 * DTO cho đổi mật khẩu
 */
const ChangePasswordDto = z.object({
    oldPassword: z.string()
        .min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z.string()
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
        .max(255, 'Mật khẩu không được quá 255 ký tự')
});

module.exports = {
    RegisterDto,
    LoginDto,
    RefreshTokenDto,
    ChangePasswordDto
};
