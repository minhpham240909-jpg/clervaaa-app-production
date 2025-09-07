import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Clerva database seeding...')

  // Create sample subjects
  console.log('📚 Creating subjects...')
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        category: 'STEM',
        description: 'Various topics in mathematics including algebra, calculus, statistics',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'Computer Science' },
      update: {},
      create: {
        name: 'Computer Science',
        category: 'STEM',
        description: 'Programming, algorithms, data structures, software engineering',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'Physics' },
      update: {},
      create: {
        name: 'Physics',
        category: 'STEM',
        description: 'Classical mechanics, thermodynamics, electromagnetism, quantum physics',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'Chemistry' },
      update: {},
      create: {
        name: 'Chemistry',
        category: 'STEM',
        description: 'Organic chemistry, inorganic chemistry, biochemistry',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'Biology' },
      update: {},
      create: {
        name: 'Biology',
        category: 'STEM',
        description: 'Cell biology, genetics, molecular biology, ecology',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'English Literature' },
      update: {},
      create: {
        name: 'English Literature',
        category: 'Humanities',
        description: 'Literary analysis, creative writing, composition',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'History' },
      update: {},
      create: {
        name: 'History',
        category: 'Humanities',
        description: 'World history, American history, historical analysis',
      },
    }),
    prisma.subject.upsert({
      where: { name: 'Psychology' },
      update: {},
      create: {
        name: 'Psychology',
        category: 'Social Sciences',
        description: 'Cognitive psychology, social psychology, developmental psychology',
      },
    }),
  ])

  console.log('🏆 Creating achievements...')
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { name: 'First Steps' },
      update: {},
      create: {
        name: 'First Steps',
        description: 'Complete your first study session',
        category: 'STUDY_TIME',
        icon: '🎯',
        rarity: 'COMMON',
        criteria: JSON.stringify({ studySessions: 1 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Dedicated Learner' },
      update: {},
      create: {
        name: 'Dedicated Learner',
        description: 'Study for 10 hours total',
        category: 'STUDY_TIME',
        icon: '📚',
        rarity: 'COMMON',
        criteria: JSON.stringify({ totalHours: 10 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Marathon Scholar' },
      update: {},
      create: {
        name: 'Marathon Scholar',
        description: 'Study for 100 hours total',
        category: 'STUDY_TIME',
        icon: '🏃‍♂️',
        rarity: 'RARE',
        criteria: JSON.stringify({ totalHours: 100 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Streak Master' },
      update: {},
      create: {
        name: 'Streak Master',
        description: 'Maintain a 7-day study streak',
        category: 'CONSISTENCY',
        icon: '🔥',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ streakDays: 7 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Social Butterfly' },
      update: {},
      create: {
        name: 'Social Butterfly',
        description: 'Join 5 study groups',
        category: 'COLLABORATION',
        icon: '🦋',
        rarity: 'COMMON',
        criteria: JSON.stringify({ studyGroups: 5 }),
      },
    }),
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`📚 Created ${subjects.length} subjects`)
  console.log(`🏆 Created ${achievements.length} achievements`)
}

main()
  .catch((e: any) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



