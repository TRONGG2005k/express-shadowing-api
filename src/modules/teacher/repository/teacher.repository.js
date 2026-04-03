const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho Teacher sử dụng Prisma
 */
class TeacherRepository {
    /**
     * Lấy danh sách giáo viên với filter và pagination
     */
    async findAll({ page, limit, search, sortBy, order }) {
        logger.info(`[TeacherRepository] [findAll] Bắt đầu | Page: ${page}, Limit: ${limit}, Search: ${search}`);

        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong full_name)
        if (search) {
            where.full_name = { contains: search, mode: 'insensitive' };
            logger.info(`[TeacherRepository] [findAll] Áp dụng filter search: ${search}`);
        }

        const skip = (page - 1) * limit;
        logger.info(`[TeacherRepository] [findAll] Skip: ${skip}, Take: ${limit}`);

        // Đếm tổng số records
        const totalCount = await prisma.teacher.count({ where });
        logger.info(`[TeacherRepository] [findAll] Tổng số records: ${totalCount}`);

        // Lấy danh sách
        const teachers = await prisma.teacher.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            },
            include: {
                Renamedclass: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        logger.info(`[TeacherRepository] [findAll] Lấy thành công ${teachers.length} records`);
        return {
            data: teachers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    /**
     * Lấy giáo viên theo ID
     */
    async findById(id) {
        logger.info(`[TeacherRepository] [findById] Bắt đầu | ID: ${id}`);

        const teacher = await prisma.teacher.findUnique({
            where: {
                id,
                deleted_at: null
            },
            include: {
                Renamedclass: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        created_at: true
                    }
                }
            }
        });

        if (teacher) {
            logger.info(`[TeacherRepository] [findById] Tìm thấy | ID: ${id} | Name: ${teacher.full_name}`);
        } else {
            logger.warn(`[TeacherRepository] [findById] Không tìm thấy | ID: ${id}`);
        }

        return teacher;
    }

    /**
     * Kiểm tra giáo viên đã tồn tại chưa (theo tên)
     */
    async existsByName(fullName) {
        logger.info(`[TeacherRepository] [existsByName] Kiểm tra | Name: ${fullName}`);

        const count = await prisma.teacher.count({
            where: {
                full_name: { equals: fullName, mode: 'insensitive' },
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[TeacherRepository] [existsByName] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra giáo viên đã tồn tại chưa (theo tên, trừ ID hiện tại - dùng cho update)
     */
    async existsByNameExcludingId(fullName, excludeId) {
        logger.info(`[TeacherRepository] [existsByNameExcludingId] Kiểm tra | Name: ${fullName}, ExcludeId: ${excludeId}`);

        const count = await prisma.teacher.count({
            where: {
                full_name: { equals: fullName, mode: 'insensitive' },
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[TeacherRepository] [existsByNameExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Tạo mới giáo viên
     */
    async create(data) {
        logger.info(`[TeacherRepository] [create] Bắt đầu | Name: ${data.full_name}`);

        const created = await prisma.teacher.create({
            data: {
                full_name: data.full_name,
                bio: data.bio || null,
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                Renamedclass: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        logger.info(`[TeacherRepository] [create] Thành công | ID: ${created.id} | Name: ${created.full_name}`);
        return created;
    }

    /**
     * Cập nhật giáo viên
     */
    async update(id, data) {
        logger.info(`[TeacherRepository] [update] Bắt đầu | ID: ${id} | Data: ${JSON.stringify(data)}`);

        const updateData = {
            updated_at: new Date()
        };

        if (data.full_name !== undefined) {
            updateData.full_name = data.full_name;
        }
        if (data.bio !== undefined) {
            updateData.bio = data.bio || null;
        }

        const updated = await prisma.teacher.update({
            where: { id },
            data: updateData,
            include: {
                Renamedclass: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        logger.info(`[TeacherRepository] [update] Thành công | ID: ${id} | Name: ${updated.full_name}`);
        return updated;
    }

    /**
     * Xóa mềm giáo viên (soft delete)
     */
    async softDelete(id) {
        logger.info(`[TeacherRepository] [softDelete] Bắt đầu | ID: ${id}`);

        const deleted = await prisma.teacher.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[TeacherRepository] [softDelete] Thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Xóa cứng giáo viên (hard delete)
     */
    async delete(id) {
        logger.info(`[TeacherRepository] [delete] Bắt đầu xóa cứng | ID: ${id}`);

        const deleted = await prisma.teacher.delete({
            where: { id }
        });

        logger.info(`[TeacherRepository] [delete] Xóa cứng thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Lấy danh sách lớp học của giáo viên
     */
    async findClassesByTeacherId(teacherId) {
        logger.info(`[TeacherRepository] [findClassesByTeacherId] Bắt đầu | TeacherId: ${teacherId}`);

        const classes = await prisma.renamedclass.findMany({
            where: {
                teacher_id: teacherId,
                deleted_at: null
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        full_name: true
                    }
                },
                _count: {
                    select: {
                        student_class: true,
                        assignment_class: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        logger.info(`[TeacherRepository] [findClassesByTeacherId] Thành công | Classes: ${classes.length}`);
        return classes;
    }
}

module.exports = new TeacherRepository();
