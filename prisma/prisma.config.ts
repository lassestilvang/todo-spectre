import { PrismaClient } from '@prisma/client'

// Basic Prisma client with SQLite configuration
const prisma = new PrismaClient()

export { prisma }
export default prisma