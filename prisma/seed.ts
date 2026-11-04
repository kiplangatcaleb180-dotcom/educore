import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting EducoreAPP Next.js 15 Database Seeding...');

  const passwordHash = await bcrypt.hash('1234567890Fa!', 10);

  // 1. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'ciphersentinel@yahoo.com' },
    update: {
      role: 'ADMIN',
      passwordHash,
      isActive: true,
      pendingApproval: false,
      isBlocked: false,
    },
    create: {
      firstName: 'Cipher',
      surname: 'Sentinel',
      email: 'ciphersentinel@yahoo.com',
      passwordHash,
      role: 'ADMIN',
      staffId: 'ADM-CS',
      isActive: true,
      pendingApproval: false,
      isBlocked: false,
    },
  });
  console.log('Admin account ready:', admin.email);

  // 2. Lecturer Account
  const lecturer = await prisma.user.upsert({
    where: { email: 'ronaldkoech64@gmail.com' },
    update: {
      role: 'LECTURER',
      passwordHash,
      isActive: true,
      pendingApproval: false,
      isBlocked: false,
    },
    create: {
      firstName: 'Ronald',
      surname: 'Koech',
      email: 'ronaldkoech64@gmail.com',
      passwordHash,
      role: 'LECTURER',
      staffId: 'LEC-64',
      isActive: true,
      pendingApproval: false,
      isBlocked: false,
    },
  });
  console.log('Lecturer account ready:', lecturer.email);

  // 3. Faculty & Departments (Specializations)
  const faculty = await prisma.faculty.upsert({
    where: { code: 'FST' },
    update: {},
    create: {
      name: 'Faculty of Science & Technology',
      code: 'FST',
      description: 'Computing, Engineering, and Physical Sciences',
    },
  });

  const specializations = [
    { name: 'Networking', code: 'NET', description: 'Computer Networks, Cybersecurity, and Infrastructure' },
    { name: 'Hardware', code: 'HW', description: 'Computer Architecture, Embedded Systems, and Maintenance' },
    { name: 'Software', code: 'SW', description: 'Software Development, Mobile Apps, and Cloud Computing' },
    { name: 'Database', code: 'DB', description: 'Database Management Systems, Data Warehousing, and SQL' },
  ];

  for (const spec of specializations) {
    await prisma.department.upsert({
      where: { code: spec.code },
      update: {},
      create: {
        name: spec.name,
        code: spec.code,
        description: spec.description,
        facultyId: faculty.id,
      },
    });
  }

  // Legacy department for backward compatibility (if needed)
  const department = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      name: 'Department of Computer Science',
      code: 'CS',
      description: 'General Computer Science',
      facultyId: faculty.id,
      headId: lecturer.id,
    },
  });

  // 4. Sample Course
  const course = await prisma.course.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      description: 'Comprehensive analysis of lists, trees, graphs, and search/sort algorithms.',
      credits: 4,
      departmentId: department.id,
      lecturerId: lecturer.id,
      semester: '1',
      academicYear: '2025/2026',
    },
  });

  // 5. Sample Exam
  await prisma.exam.upsert({
    where: { code: 'EXAM-CS201-CAT1' },
    update: {},
    create: {
      code: 'EXAM-CS201-CAT1',
      title: 'CAT 1: Sorting & Complexity Analysis',
      type: 'CAT',
      courseId: course.id,
      creatorId: lecturer.id,
      durationMinutes: 60,
      totalMarks: 30,
      passMark: 15,
      status: 'PUBLISHED',
      isOpen: true,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
