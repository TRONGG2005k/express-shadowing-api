const { z } = require('zod');

/**
 * DTO cho tạo mới user
 */
const CreateUserDto = z.object({
    username: z.string()
        .min(3, 'Username phải có ít nhất 3 ký tự')
        .max(100, 'Username không được vượt quá 100 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ cái, số và dấu gạch dưới'),

    phone: z.string()
        .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
        .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
        .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ'),

    password: z.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(255, 'Mật khẩu không được vượt quá 255 ký tự'),

    role: z.enum(['admin', 'teacher', 'student'], {
        errorMap: () => ({ message: 'Role phải là admin, teacher hoặc student' })
    }),

    ref_id: z.coerce.bigint()
        .positive('ID tham chiếu phải là số dương')
        .optional()
        .nullable(),

    ref_type: z.enum(['student', 'teacher', 'admin'], {
        errorMap: () => ({ message: 'Ref type phải là student, teacher hoặc admin' })
    }).optional().nullable(),

    is_active: z.boolean()
        .default(true)
});

/**
 * DTO cho cập nhật user
 * Tất cả các field đều optional
 */
const UpdateUserDto = CreateUserDto.partial();

/**
 * DTO cho query params (filter, pagination)
 */
const UserQueryDto = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
        .int()
        .positive()
        .max(100)
        .default(10),

    search: z.string()
        .optional(),

    role: z.enum(['admin', 'teacher', 'student'])
        .optional(),

    is_active: z.coerce.boolean()
        .optional(),

    sortBy: z.enum(['username', 'created_at', 'updated_at', 'role'])
        .default('created_at'),

    order: z.enum(['asc', 'desc'])
        .default('desc')
});

/**
 * DTO cho ID param
 */
const UserIdParamDto = z.object({
    id: z.coerce.bigint()
        .positive('ID phải là số dương')
});

module.exports = {
    CreateUserDto,
    UpdateUserDto,
    UserQueryDto,
    UserIdParamDto
};