import { PrismaClient } from '@prisma/client'

// Basic Prisma client with SQLite configuration
const prisma = new PrismaClient({
  datasourceUrl: 'file:./dev.db'
})

export { prisma }
export default prisma