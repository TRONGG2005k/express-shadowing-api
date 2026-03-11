const { z } = require('zod');

// Enum từ Prisma schema
const VocabularyType = ['noun', 'verb', 'adjective', 'adverb', 'phrase'];

/**
 * DTO cho tạo mới vocabulary
 */
const CreateVocabularyDto = z.object({
    word: z.string()
        .min(1, 'Từ vựng không được để trống')
        .max(100, 'Từ vựng không được vượt quá 100 ký tự'),
    
    type: z.enum(VocabularyType, {
        errorMap: () => ({ message: 'Loại từ phải là một trong: noun, verb, adjective, adverb, phrase' })
    }),
    
    topic: z.string()
        .max(100, 'Chủ đề không được vượt quá 100 ký tự')
        .optional()
        .nullable(),
    
    phonetic: z.string()
        .max(100, 'Phiên âm không được vượt quá 100 ký tự')
        .optional()
        .nullable(),
    
    meaning_vi: z.string()
        .min(1, 'Nghĩa tiếng Việt không được để trống'),
    
    explanation: z.string()
        .optional()
        .nullable(),
    
    example_sentence: z.string()
        .optional()
        .nullable(),
    
    example_translation: z.string()
        .optional()
        .nullable(),
    
    audio_url: z.string()
        .max(500, 'URL audio không được vượt quá 500 ký tự')
        .url('URL audio không hợp lệ')
        .optional()
        .nullable(),
    
    image_url: z.string()
        .max(500, 'URL hình ảnh không được vượt quá 500 ký tự')
        .url('URL hình ảnh không hợp lệ')
        .optional()
        .nullable(),
    
    created_by: z.coerce.bigint()
        .positive('ID ngườI tạo phải là số dương')
});

/**
 * DTO cho cập nhật vocabulary
 * Tất cả các field đều optional
 */
const UpdateVocabularyDto = CreateVocabularyDto.partial();

/**
 * DTO cho query params (filter, pagination)
 */
const VocabularyQueryDto = z.object({
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
    
    type: z.enum([...VocabularyType, ''])
        .optional()
        .nullable(),
    
    topic: z.string()
        .optional()
        .nullable(),
    
    sortBy: z.enum(['word', 'created_at', 'updated_at'])
        .default('created_at'),
    
    order: z.enum(['asc', 'desc'])
        .default('desc')
});

/**
 * DTO cho ID param
 */
const VocabularyIdParamDto = z.object({
    id: z.coerce.bigint()
        .positive('ID phảI là số dương')
});

module.exports = {
    CreateVocabularyDto,
    UpdateVocabularyDto,
    VocabularyQueryDto,
    VocabularyIdParamDto,
    VocabularyType
};
