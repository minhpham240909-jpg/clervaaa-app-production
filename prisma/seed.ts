import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive Clerva database seeding...')

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
    // Study Time Achievements
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
      where: { name: 'Study Warrior' },
      update: {},
      create: {
        name: 'Study Warrior',
        description: 'Study for 10 hours total',
        category: 'STUDY_TIME',
        icon: '⚔️',
        rarity: 'UNCOMMON',
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
    // Consistency Achievements
    prisma.achievement.upsert({
      where: { name: 'Consistent Learner' },
      update: {},
      create: {
        name: 'Consistent Learner',
        description: 'Study for 7 days in a row',
        category: 'CONSISTENCY',
        icon: '🔥',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ streak: 7 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Dedication Master' },
      update: {},
      create: {
        name: 'Dedication Master',
        description: 'Study for 30 days in a row',
        category: 'CONSISTENCY',
        icon: '👑',
        rarity: 'EPIC',
        criteria: JSON.stringify({ streak: 30 }),
      },
    }),
    // Collaboration Achievements
    prisma.achievement.upsert({
      where: { name: 'Team Player' },
      update: {},
      create: {
        name: 'Team Player',
        description: 'Form your first study partnership',
        category: 'COLLABORATION',
        icon: '🤝',
        rarity: 'COMMON',
        criteria: JSON.stringify({ partnerships: 1 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Social Scholar' },
      update: {},
      create: {
        name: 'Social Scholar',
        description: 'Form 5 study partnerships',
        category: 'COLLABORATION',
        icon: '👥',
        rarity: 'RARE',
        criteria: JSON.stringify({ partnerships: 5 }),
      },
    }),
    // Academic Achievements
    prisma.achievement.upsert({
      where: { name: 'Goal Getter' },
      update: {},
      create: {
        name: 'Goal Getter',
        description: 'Complete your first goal',
        category: 'ACADEMIC',
        icon: '🎯',
        rarity: 'COMMON',
        criteria: JSON.stringify({ goalsCompleted: 1 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Overachiever' },
      update: {},
      create: {
        name: 'Overachiever',
        description: 'Complete 10 goals',
        category: 'ACADEMIC',
        icon: '🏆',
        rarity: 'EPIC',
        criteria: JSON.stringify({ goalsCompleted: 10 }),
      },
    }),
    // Special Achievements
    prisma.achievement.upsert({
      where: { name: 'Night Owl' },
      update: {},
      create: {
        name: 'Night Owl',
        description: 'Study between 10 PM and 2 AM',
        category: 'SPECIAL',
        icon: '🦉',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ lateNightStudy: true }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Early Bird' },
      update: {},
      create: {
        name: 'Early Bird',
        description: 'Study between 5 AM and 8 AM',
        category: 'SPECIAL',
        icon: '🐦',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ earlyMorningStudy: true }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Pomodoro Pro' },
      update: {},
      create: {
        name: 'Pomodoro Pro',
        description: 'Complete 25 pomodoro sessions',
        category: 'SKILL',
        icon: '🍅',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ pomodoroSessions: 25 }),
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Clerva Legend' },
      update: {},
      create: {
        name: 'Clerva Legend',
        description: 'Reach 1000 total points',
        category: 'MILESTONE',
        icon: '🌟',
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ totalPoints: 1000 }),
      },
    }),
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`📚 Created ${subjects.length} subjects`)
  console.log(`🏆 Created ${achievements.length} achievements`)
  console.log('')
  console.log('🎯 Your Clerva database is ready with:')
  console.log('   • Comprehensive user profiles with study preferences')
  console.log('   • Personal study session tracking')
  console.log('   • Partnership system for study buddies')
  console.log('   • Goal setting and achievement system')
  console.log('   • Gamification with badges and points')
  console.log('   • Progress metrics and analytics')
  console.log('   • AI chatbot conversation history')
  console.log('   • Real-time chat and calling features')
  console.log('   • Advanced reminder and notification system')
  console.log('   • Calendar integration for events')
  console.log('')
  console.log('🚀 Ready to generate Prisma client and start developing!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e: any) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })