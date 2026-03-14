const { z } = require('zod');

/**
 * DTO cho tạo mới teacher
 */
const CreateTeacherDto = z.object({
    full_name: z.string()
        .min(1, 'Họ tên không được để trống')
        .max(100, 'Họ tên không được vượt quá 100 ký tự'),

    bio: z.string()
        .max(1000, 'Tiểu sử không được vượt quá 1000 ký tự')
        .optional()
        .nullable()
});

/**
 * DTO cho cập nhật teacher
 * Tất cả các field đều optional
 */
const UpdateTeacherDto = CreateTeacherDto.partial();

/**
 * DTO cho query params (filter, pagination)
 */
const TeacherQueryDto = z.object({
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

    sortBy: z.enum(['full_name', 'created_at', 'updated_at'])
        .default('created_at'),

    order: z.enum(['asc', 'desc'])
        .default('desc')
});

/**
 * DTO cho ID param
 */
const TeacherIdParamDto = z.object({
    id: z.coerce.bigint()
        .positive('ID phải là số dương')
});

module.exports = {
    CreateTeacherDto,
    UpdateTeacherDto,
    TeacherQueryDto,
    TeacherIdParamDto
};
