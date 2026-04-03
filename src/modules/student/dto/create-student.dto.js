const { z } = require('zod');

/**
 * DTO cho tạo mới student
 */
const CreateStudentDto = z.object({
    full_name: z.string()
        .min(1, 'Họ tên không được để trống')
        .max(100, 'Họ tên không được vượt quá 100 ký tự'),

    phone: z.string()
        .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
        .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
        .optional()
        .nullable(),

    dob: z.coerce.date()
        .optional()
        .nullable()
        .refine((date) => {
            if (!date) return true;
            const now = new Date();
            const birthDate = new Date(date);
            return birthDate < now;
        }, {
            message: 'Ngày sinh phải trong quá khứ'
        })
});

/**
 * DTO cho cập nhật student
 * Tất cả các field đều optional
 */
const UpdateStudentDto = CreateStudentDto.partial();

/**
 * DTO cho query params (filter, pagination)
 */
const StudentQueryDto = z.object({
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

    classId: z.coerce.bigint()
        .positive()
        .optional(),

    sortBy: z.enum(['full_name', 'created_at', 'updated_at', 'dob'])
        .default('created_at'),

    order: z.enum(['asc', 'desc'])
        .default('desc')
});

/**
 * DTO cho ID param
 */
const StudentIdParamDto = z.object({
    id: z.coerce.bigint()
        .positive('ID phải là số dương')
});

/**
 * DTO cho thêm học sinh vào lớp
 */
const AddToClassDto = z.object({
    class_id: z.coerce.bigint()
        .positive('ID lớp học phải là số dương')
});

module.exports = {
    CreateStudentDto,
    UpdateStudentDto,
    StudentQueryDto,
    StudentIdParamDto,
    AddToClassDto
};
