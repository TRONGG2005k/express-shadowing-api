const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho Student sử dụng Prisma
 */
class StudentRepository {
    /**
     * Lấy danh sách học sinh với filter và pagination
     */
    async findAll({ page, limit, search, sortBy, order }) {
        logger.info(`[StudentRepository] [findAll] Bắt đầu | Page: ${page}, Limit: ${limit}, Search: ${search}`);

        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong full_name)
        if (search) {
            where.full_name = { contains: search, mode: 'insensitive' };
            logger.info(`[StudentRepository] [findAll] Áp dụng filter search: ${search}`);
        }

        const skip = (page - 1) * limit;
        logger.info(`[StudentRepository] [findAll] Skip: ${skip}, Take: ${limit}`);

        // Đếm tổng số records
        const totalCount = await prisma.student.count({ where });
        logger.info(`[StudentRepository] [findAll] Tổng số records: ${totalCount}`);

        // Lấy danh sách
        const students = await prisma.student.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            },
            include: {
                student_class: {
                    include: {
                        Renamedclass: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        logger.info(`[StudentRepository] [findAll] Lấy thành công ${students.length} records`);
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
     * Lấy danh sách học sinh theo lớp học
     */
    async findByClass({ page, limit, sortBy, order, classId }) {
        logger.info(`[StudentRepository] [findByClass] Bắt đầu | Class ID: ${classId}, Page: ${page}, Limit: ${limit}`);

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

        // Lấy danh sách
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
                    include: {
                        Renamedclass: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        logger.info(`[StudentRepository] [findByClass] Hoàn thành | students: ${students.length}/${totalCount}`);
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
     * Lấy học sinh theo ID
     */
    async findById(id) {
        logger.info(`[StudentRepository] [findById] Bắt đầu | ID: ${id}`);

        const student = await prisma.student.findUnique({
            where: {
                id,
                deleted_at: null
            },
            include: {
                student_class: {
                    include: {
                        Renamedclass: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        }
                    }
                }
            }
        });

        if (student) {
            logger.info(`[StudentRepository] [findById] Tìm thấy | ID: ${id} | Name: ${student.full_name}`);
        } else {
            logger.warn(`[StudentRepository] [findById] Không tìm thấy | ID: ${id}`);
        }

        return student;
    }

    /**
     * Kiểm tra học sinh đã tồn tại chưa (theo tên và ngày sinh)
     */
    async existsByNameAndDob(fullName, dob) {
        logger.info(`[StudentRepository] [existsByNameAndDob] Kiểm tra | Name: ${fullName}, DOB: ${dob}`);

        const count = await prisma.student.count({
            where: {
                full_name: { equals: fullName, mode: 'insensitive' },
                dob: dob ? new Date(dob) : null,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [existsByNameAndDob] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra số điện thoại đã tồn tại chưa
     */
    async existsByPhone(phone) {
        logger.info(`[StudentRepository] [existsByPhone] Kiểm tra | Phone: ${phone}`);

        const count = await prisma.student.count({
            where: {
                phone: phone,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [existsByPhone] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra học sinh đã tồn tại chưa (theo tên và ngày sinh, trừ ID hiện tại - dùng cho update)
     */
    async existsByNameAndDobExcludingId(fullName, dob, excludeId) {
        logger.info(`[StudentRepository] [existsByNameAndDobExcludingId] Kiểm tra | Name: ${fullName}, DOB: ${dob}, ExcludeId: ${excludeId}`);

        const count = await prisma.student.count({
            where: {
                full_name: { equals: fullName, mode: 'insensitive' },
                dob: dob ? new Date(dob) : null,
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [existsByNameAndDobExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra số điện thoại đã tồn tại chưa (trừ ID hiện tại - dùng cho update)
     */
    async existsByPhoneExcludingId(phone, excludeId) {
        logger.info(`[StudentRepository] [existsByPhoneExcludingId] Kiểm tra | Phone: ${phone}, ExcludeId: ${excludeId}`);

        const count = await prisma.student.count({
            where: {
                phone: phone,
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [existsByPhoneExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra lớp học có tồn tại không
     */
    async classExists(classId) {
        logger.info(`[StudentRepository] [classExists] Kiểm tra | ClassId: ${classId}`);

        const count = await prisma.renamedclass.count({
            where: {
                id: classId,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [classExists] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra học sinh đã trong lớp chưa
     */
    async isStudentInClass(studentId, classId) {
        logger.info(`[StudentRepository] [isStudentInClass] Kiểm tra | Student: ${studentId}, Class: ${classId}`);

        const count = await prisma.student_class.count({
            where: {
                student_id: studentId,
                class_id: classId
            }
        });

        const exists = count > 0;
        logger.info(`[StudentRepository] [isStudentInClass] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Tạo mới học sinh
     */
    async create(data) {
        logger.info(`[StudentRepository] [create] Bắt đầu | Name: ${data.full_name}`);

        const created = await prisma.student.create({
            data: {
                full_name: data.full_name,
                phone: data.phone || null,
                dob: data.dob ? new Date(data.dob) : null,
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                student_class: {
                    include: {
                        Renamedclass: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        logger.info(`[StudentRepository] [create] Thành công | ID: ${created.id} | Name: ${created.full_name}`);
        return created;
    }

    /**
     * Cập nhật học sinh
     */
    async update(id, data) {
        logger.info(`[StudentRepository] [update] Bắt đầu | ID: ${id} | Data: ${JSON.stringify(data)}`);

        const updateData = {
            updated_at: new Date()
        };

        if (data.full_name !== undefined) {
            updateData.full_name = data.full_name;
        }
        if (data.phone !== undefined) {
            updateData.phone = data.phone || null;
        }
        if (data.dob !== undefined) {
            updateData.dob = data.dob ? new Date(data.dob) : null;
        }

        const updated = await prisma.student.update({
            where: { id },
            data: updateData,
            include: {
                student_class: {
                    include: {
                        Renamedclass: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        logger.info(`[StudentRepository] [update] Thành công | ID: ${id} | Name: ${updated.full_name}`);
        return updated;
    }

    /**
     * Xóa mềm học sinh (soft delete)
     */
    async softDelete(id) {
        logger.info(`[StudentRepository] [softDelete] Bắt đầu | ID: ${id}`);

        const deleted = await prisma.student.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[StudentRepository] [softDelete] Thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Xóa cứng học sinh (hard delete)
     */
    async delete(id) {
        logger.info(`[StudentRepository] [delete] Bắt đầu xóa cứng | ID: ${id}`);

        const deleted = await prisma.student.delete({
            where: { id }
        });

        logger.info(`[StudentRepository] [delete] Xóa cứng thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Thêm học sinh vào lớp học
     */
    async addToClass(studentId, classId) {
        logger.info(`[StudentRepository] [addToClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        const result = await prisma.student_class.create({
            data: {
                student_id: studentId,
                class_id: classId,
                joined_at: new Date()
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

        logger.info(`[StudentRepository] [addToClass] Thành công`);
        return result;
    }

    /**
     * Xóa học sinh khỏi lớp học
     */
    async removeFromClass(studentId, classId) {
        logger.info(`[StudentRepository] [removeFromClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        const result = await prisma.student_class.deleteMany({
            where: {
                student_id: studentId,
                class_id: classId
            }
        });

        logger.info(`[StudentRepository] [removeFromClass] Thành công | Deleted: ${result.count}`);
        return result;
    }
}

module.exports = new StudentRepository();
