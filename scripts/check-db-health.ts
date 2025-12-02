import { getDatabaseHealth } from '../src/lib/db-utils'
import { prisma } from '../prisma/prisma.config'

async function checkDatabaseHealth() {
  console.log('Checking database health...')

  try {
    const health = await getDatabaseHealth()

    console.log('\n=== Database Health Report ===')
    console.log(`Connected: ${health.connected ? '✅' : '❌'}`)
    console.log(`Tables: ${health.tables.length}`)

    if (health.tables.length > 0) {
      console.log('\nTables found:')
      health.tables.forEach(table => console.log(`  - ${table}`))
    }

    console.log('\nRecord counts:')
    Object.entries(health.recordCounts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`)
    })

    if (health.error) {
      console.error('\n❌ Database Error:', health.error.message)
      console.error('Error type:', health.error.type)
      if (health.error.context) {
        console.error('Context:', health.error.context)
      }
    } else {
      console.log('\n✅ Database is healthy and operational')
    }

    // Additional connection test
    console.log('\nTesting direct connection...')
    try {
      await prisma.$connect()
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Direct connection test passed:', result)
      await prisma.$disconnect()
    } catch (connError) {
      console.error('❌ Direct connection test failed:', connError)
    }

  } catch (error) {
    console.error('Database health check failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  checkDatabaseHealth()
}

export { checkDatabaseHealth }