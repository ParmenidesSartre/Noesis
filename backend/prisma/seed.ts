import { PrismaClient, Role, SubscriptionPlan, PlanStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords (same for all test users for simplicity)
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Calculate trial end date (14 days from now)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // ===== Organization 1: ABC Tuition Centre =====
  console.log('\n📚 Creating ABC Tuition Centre...');
  const org1 = await prisma.organization.upsert({
    where: { slug: 'abc-tuition' },
    update: {},
    create: {
      name: 'ABC Tuition Centre',
      slug: 'abc-tuition',
      email: 'admin@abc-tuition.com',
      phone: '+1234567890',
      address: '123 Main Street, City Center',
      country: 'Singapore',
      plan: SubscriptionPlan.PROFESSIONAL,
      planStatus: PlanStatus.ACTIVE,
      trialEndsAt: null, // Already active
      maxStudents: 200,
      maxBranches: 5,
      isActive: true,
    },
  });
  console.log(`✅ Created organization: ${org1.name}`);

  // Create branches for ABC Tuition
  const branch1 = await prisma.branch.upsert({
    where: { code_organizationId: { code: 'ABC-MAIN', organizationId: org1.id } },
    update: {},
    create: {
      name: 'Main Branch',
      code: 'ABC-MAIN',
      address: '123 Main Street, City Center',
      phone: '+1234567890',
      organizationId: org1.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Created branch: ${branch1.name}`);

  const branch2 = await prisma.branch.upsert({
    where: { code_organizationId: { code: 'ABC-EAST', organizationId: org1.id } },
    update: {},
    create: {
      name: 'East Branch',
      code: 'ABC-EAST',
      address: '456 East Avenue, East District',
      phone: '+1234567891',
      organizationId: org1.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Created branch: ${branch2.name}`);

  // Create users for ABC Tuition
  const superAdmin1 = await prisma.user.upsert({
    where: { email_organizationId: { email: 'admin@abc-tuition.com', organizationId: org1.id } },
    update: {},
    create: {
      email: 'admin@abc-tuition.com',
      password: hashedPassword,
      name: 'John Admin',
      role: Role.SUPER_ADMIN,
      organizationId: org1.id,
      phone: '+1234567890',
      isActive: true,
    },
  });
  console.log(`  ✅ Created SUPER_ADMIN: ${superAdmin1.name}`);

  const branchAdmin1 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'branch.manager@abc-tuition.com', organizationId: org1.id },
    },
    update: {},
    create: {
      email: 'branch.manager@abc-tuition.com',
      password: hashedPassword,
      name: 'Sarah Branch Manager',
      role: Role.BRANCH_ADMIN,
      organizationId: org1.id,
      branchId: branch1.id,
      phone: '+1234567892',
      isActive: true,
    },
  });
  console.log(`  ✅ Created BRANCH_ADMIN: ${branchAdmin1.name}`);

  const teacher1 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'teacher.math@abc-tuition.com', organizationId: org1.id },
    },
    update: {},
    create: {
      email: 'teacher.math@abc-tuition.com',
      password: hashedPassword,
      name: 'Michael Mathematics',
      role: Role.TEACHER,
      organizationId: org1.id,
      branchId: branch1.id,
      phone: '+1234567893',
      isActive: true,
    },
  });
  console.log(`  ✅ Created TEACHER: ${teacher1.name}`);

  const teacher2 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'teacher.science@abc-tuition.com', organizationId: org1.id },
    },
    update: {},
    create: {
      email: 'teacher.science@abc-tuition.com',
      password: hashedPassword,
      name: 'Emma Science',
      role: Role.TEACHER,
      organizationId: org1.id,
      branchId: branch2.id,
      phone: '+1234567894',
      isActive: true,
    },
  });
  console.log(`  ✅ Created TEACHER: ${teacher2.name}`);

  const parent1 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'parent.johnson@example.com', organizationId: org1.id },
    },
    update: {},
    create: {
      email: 'parent.johnson@example.com',
      password: hashedPassword,
      name: 'Robert Johnson',
      role: Role.PARENT,
      organizationId: org1.id,
      phone: '+1234567895',
      isActive: true,
    },
  });
  console.log(`  ✅ Created PARENT: ${parent1.name}`);

  const student1 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'student.alice@example.com', organizationId: org1.id },
    },
    update: {},
    create: {
      email: 'student.alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      role: Role.STUDENT,
      organizationId: org1.id,
      branchId: branch1.id,
      phone: '+1234567896',
      isActive: true,
    },
  });
  console.log(`  ✅ Created STUDENT: ${student1.name}`);

  const student2 = await prisma.user.upsert({
    where: { email_organizationId: { email: 'student.bob@example.com', organizationId: org1.id } },
    update: {},
    create: {
      email: 'student.bob@example.com',
      password: hashedPassword,
      name: 'Bob Smith',
      role: Role.STUDENT,
      organizationId: org1.id,
      branchId: branch1.id,
      phone: '+1234567897',
      isActive: true,
    },
  });
  console.log(`  ✅ Created STUDENT: ${student2.name}`);

  // ===== Organization 2: XYZ Learning Hub =====
  console.log('\n📚 Creating XYZ Learning Hub...');
  const org2 = await prisma.organization.upsert({
    where: { slug: 'xyz-learning' },
    update: {},
    create: {
      name: 'XYZ Learning Hub',
      slug: 'xyz-learning',
      email: 'admin@xyz-learning.com',
      phone: '+1987654321',
      address: '789 West Road, West District',
      country: 'Singapore',
      plan: SubscriptionPlan.FREE_TRIAL,
      planStatus: PlanStatus.TRIAL,
      trialEndsAt,
      maxStudents: 50,
      maxBranches: 1,
      isActive: true,
    },
  });
  console.log(`✅ Created organization: ${org2.name}`);

  const branch3 = await prisma.branch.upsert({
    where: { code_organizationId: { code: 'XYZ-MAIN', organizationId: org2.id } },
    update: {},
    create: {
      name: 'Main Campus',
      code: 'XYZ-MAIN',
      address: '789 West Road, West District',
      phone: '+1987654321',
      organizationId: org2.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Created branch: ${branch3.name}`);

  const superAdmin2 = await prisma.user.upsert({
    where: { email_organizationId: { email: 'admin@xyz-learning.com', organizationId: org2.id } },
    update: {},
    create: {
      email: 'admin@xyz-learning.com',
      password: hashedPassword,
      name: 'Jane Admin',
      role: Role.SUPER_ADMIN,
      organizationId: org2.id,
      phone: '+1987654321',
      isActive: true,
    },
  });
  console.log(`  ✅ Created SUPER_ADMIN: ${superAdmin2.name}`);

  const teacher3 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'teacher.english@xyz-learning.com', organizationId: org2.id },
    },
    update: {},
    create: {
      email: 'teacher.english@xyz-learning.com',
      password: hashedPassword,
      name: 'David English',
      role: Role.TEACHER,
      organizationId: org2.id,
      branchId: branch3.id,
      phone: '+1987654322',
      isActive: true,
    },
  });
  console.log(`  ✅ Created TEACHER: ${teacher3.name}`);

  const student3 = await prisma.user.upsert({
    where: {
      email_organizationId: { email: 'student.charlie@example.com', organizationId: org2.id },
    },
    update: {},
    create: {
      email: 'student.charlie@example.com',
      password: hashedPassword,
      name: 'Charlie Wilson',
      role: Role.STUDENT,
      organizationId: org2.id,
      branchId: branch3.id,
      phone: '+1987654323',
      isActive: true,
    },
  });
  console.log(`  ✅ Created STUDENT: ${student3.name}`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📝 Test Credentials (all passwords: Password123!):');
  console.log('\n--- ABC Tuition Centre (abc-tuition) ---');
  console.log('  SUPER_ADMIN:   admin@abc-tuition.com');
  console.log('  BRANCH_ADMIN:  branch.manager@abc-tuition.com');
  console.log('  TEACHER:       teacher.math@abc-tuition.com');
  console.log('  TEACHER:       teacher.science@abc-tuition.com');
  console.log('  PARENT:        parent.johnson@example.com');
  console.log('  STUDENT:       student.alice@example.com');
  console.log('  STUDENT:       student.bob@example.com');
  console.log('\n--- XYZ Learning Hub (xyz-learning) ---');
  console.log('  SUPER_ADMIN:   admin@xyz-learning.com');
  console.log('  TEACHER:       teacher.english@xyz-learning.com');
  console.log('  STUDENT:       student.charlie@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
