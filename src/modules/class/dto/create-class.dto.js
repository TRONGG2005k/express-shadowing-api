const { z } = require('zod');

/**
 * DTO cho tạo mới class
 */
const CreateClassDto = z.object({
    name: z.string()
        .min(1, 'Tên lớp không được để trống')
        .max(100, 'Tên lớp không được vượt quá 100 ký tự'),

    description: z.string()
        .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
        .optional()
        .nullable(),

    teacher_id: z.coerce.bigint()
        .positive('ID giáo viên phải là số dương')
});

/**
 * DTO cho cập nhật class
 * Tất cả các field đều optional
 */
const UpdateClassDto = CreateClassDto.partial();

/**
 * DTO cho query params (filter, pagination)
 */
const ClassQueryDto = z.object({
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

    teacher_id: z.coerce.bigint()
        .positive()
        .optional(),

    sortBy: z.enum(['name', 'created_at', 'updated_at'])
        .default('created_at'),

    order: z.enum(['asc', 'desc'])
        .default('desc')
});

/**
 * DTO cho ID param
 */
const ClassIdParamDto = z.object({
    id: z.coerce.bigint()
        .positive('ID phải là số dương')
});

module.exports = {
    CreateClassDto,
    UpdateClassDto,
    ClassQueryDto,
    ClassIdParamDto
};