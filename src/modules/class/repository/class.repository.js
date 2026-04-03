const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho Class sử dụng Prisma
 */
class ClassRepository {
    /**
     * Lấy danh sách lớp học với filter và pagination
     */
    async findAll({ page, limit, search, teacher_id, sortBy, order }) {
        logger.info(`[ClassRepository] [findAll] Bắt đầu | Page: ${page}, Limit: ${limit}, Search: ${search}, Teacher: ${teacher_id}`);

        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong name)
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
            logger.info(`[ClassRepository] [findAll] Áp dụng filter search: ${search}`);
        }

        // Filter theo teacher_id
        if (teacher_id) {
            where.teacher_id = teacher_id;
            logger.info(`[ClassRepository] [findAll] Áp dụng filter teacher_id: ${teacher_id}`);
        }

        const skip = (page - 1) * limit;
        logger.info(`[ClassRepository] [findAll] Skip: ${skip}, Take: ${limit}`);

        // Đếm tổng số records
        const totalCount = await prisma.renamedclass.count({ where });
        logger.info(`[ClassRepository] [findAll] Tổng số records: ${totalCount}`);

        // Lấy danh sách
        const classes = await prisma.renamedclass.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
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
            }
        });

        logger.info(`[ClassRepository] [findAll] Lấy thành công ${classes.length} records`);
        return {
            data: classes,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    /**
     * Lấy lớp học theo ID
     */
    async findById(id) {
        logger.info(`[ClassRepository] [findById] Bắt đầu | ID: ${id}`);

        const classData = await prisma.renamedclass.findUnique({
            where: {
                id,
                deleted_at: null
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        full_name: true,
                        bio: true
                    }
                },
                student_class: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                full_name: true,
                                phone: true,
                                dob: true
                            }
                        }
                    }
                },
                assignment_class: {
                    include: {
                        assignment: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                due_date: true
                            }
                        }
                    }
                }
            }
        });

        if (classData) {
            logger.info(`[ClassRepository] [findById] Tìm thấy | ID: ${id} | Name: ${classData.name}`);
        } else {
            logger.warn(`[ClassRepository] [findById] Không tìm thấy | ID: ${id}`);
        }

        return classData;
    }

    /**
     * Kiểm tra lớp học đã tồn tại chưa (theo tên)
     */
    async existsByName(name) {
        logger.info(`[ClassRepository] [existsByName] Kiểm tra | Name: ${name}`);

        const count = await prisma.renamedclass.count({
            where: {
                name: { equals: name, mode: 'insensitive' },
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[ClassRepository] [existsByName] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra lớp học đã tồn tại chưa (theo tên, trừ ID hiện tại - dùng cho update)
     */
    async existsByNameExcludingId(name, excludeId) {
        logger.info(`[ClassRepository] [existsByNameExcludingId] Kiểm tra | Name: ${name}, ExcludeId: ${excludeId}`);

        const count = await prisma.renamedclass.count({
            where: {
                name: { equals: name, mode: 'insensitive' },
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[ClassRepository] [existsByNameExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra giáo viên có tồn tại không
     */
    async teacherExists(teacherId) {
        logger.info(`[ClassRepository] [teacherExists] Kiểm tra | TeacherId: ${teacherId}`);

        const count = await prisma.teacher.count({
            where: {
                id: teacherId,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[ClassRepository] [teacherExists] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Tạo mới lớp học
     */
    async create(data) {
        logger.info(`[ClassRepository] [create] Bắt đầu | Name: ${data.name}`);

        const created = await prisma.renamedclass.create({
            data: {
                name: data.name,
                description: data.description || null,
                teacher_id: data.teacher_id,
                created_at: new Date(),
                updated_at: new Date()
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
            }
        });

        logger.info(`[ClassRepository] [create] Thành công | ID: ${created.id} | Name: ${created.name}`);
        return created;
    }

    /**
     * Cập nhật lớp học
     */
    async update(id, data) {
        logger.info(`[ClassRepository] [update] Bắt đầu | ID: ${id} | Data: ${JSON.stringify(data)}`);

        const updateData = {
            updated_at: new Date()
        };

        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.description !== undefined) {
            updateData.description = data.description || null;
        }
        if (data.teacher_id !== undefined) {
            updateData.teacher_id = data.teacher_id;
        }

        const updated = await prisma.renamedclass.update({
            where: { id },
            data: updateData,
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
            }
        });

        logger.info(`[ClassRepository] [update] Thành công | ID: ${id} | Name: ${updated.name}`);
        return updated;
    }

    /**
     * Xóa mềm lớp học (soft delete)
     */
    async softDelete(id) {
        logger.info(`[ClassRepository] [softDelete] Bắt đầu | ID: ${id}`);

        const deleted = await prisma.renamedclass.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[ClassRepository] [softDelete] Thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Xóa cứng lớp học (hard delete)
     */
    async delete(id) {
        logger.info(`[ClassRepository] [delete] Bắt đầu xóa cứng | ID: ${id}`);

        const deleted = await prisma.renamedclass.delete({
            where: { id }
        });

        logger.info(`[ClassRepository] [delete] Xóa cứng thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Lấy danh sách học sinh trong lớp
     */
    async findStudentsByClassId(classId, { page, limit, sortBy, order }) {
        logger.info(`[ClassRepository] [findStudentsByClassId] Bắt đầu | ClassId: ${classId}, Page: ${page}, Limit: ${limit}`);

        const where = {
            deleted_at: null,
            student_class: {
                some: {
                    class_id: classId
                }
            }
        };

        const skip = (page - 1) * limit;

        // Đếm tổng số records
        const totalCount = await prisma.student.count({ where });

        // Lấy danh sách học sinh
        const students = await prisma.student.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            },
            include: {
                student_class: {
                    where: {
                        class_id: classId
                    },
                    select: {
                        joined_at: true
                    }
                }
            }
        });

        logger.info(`[ClassRepository] [findStudentsByClassId] Thành công | Students: ${students.length}/${totalCount}`);
        return {
            data: students,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    /**
     * Kiểm tra học sinh đã trong lớp chưa
     */
    async isStudentInClass(studentId, classId) {
        logger.info(`[ClassRepository] [isStudentInClass] Kiểm tra | Student: ${studentId}, Class: ${classId}`);

        const count = await prisma.student_class.count({
            where: {
                student_id: studentId,
                class_id: classId
            }
        });

        const exists = count > 0;
        logger.info(`[ClassRepository] [isStudentInClass] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Thêm học sinh vào lớp
     */
    async addStudentToClass(studentId, classId) {
        logger.info(`[ClassRepository] [addStudentToClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        const result = await prisma.student_class.create({
            data: {
                student_id: studentId,
                class_id: classId,
                joined_at: new Date()
            },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true
                    }
                }
            }
        });

        logger.info(`[ClassRepository] [addStudentToClass] Thành công`);
        return result;
    }

    /**
     * Xóa học sinh khỏi lớp
     */
    async removeStudentFromClass(studentId, classId) {
        logger.info(`[ClassRepository] [removeStudentFromClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        const result = await prisma.student_class.deleteMany({
            where: {
                student_id: studentId,
                class_id: classId
            }
        });

        logger.info(`[ClassRepository] [removeStudentFromClass] Thành công | Deleted: ${result.count}`);
        return result;
    }
}

module.exports = new ClassRepository();