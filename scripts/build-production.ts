import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function buildProduction() {
  console.log('Starting production build process...')

  try {
    // Check environment
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Building in non-production environment')
    }

    // Clean previous build
    console.log('Cleaning previous build...')
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true })
    }

    // Install production dependencies
    console.log('Installing production dependencies...')
    execSync('bun install --production', { stdio: 'inherit' })

    // Run database migrations
    console.log('Running database migrations...')
    execSync('bun run db:migrate-full', { stdio: 'inherit' })

    // Build Next.js application
    console.log('Building Next.js application...')
    execSync('bun run build', { stdio: 'inherit' })

    // Optimize build
    console.log('Optimizing build...')
    await optimizeBuild()

    // Create build info
    console.log('Creating build information...')
    createBuildInfo()

    console.log('Production build completed successfully!')
  } catch (error) {
    console.error('Production build failed:', error)
    process.exit(1)
  }
}

async function optimizeBuild() {
  // Add build optimizations here
  console.log('Running build optimizations...')

  // Example: Compress assets, optimize images, etc.
  // This would be extended with actual optimization logic
}

function createBuildInfo() {
  const buildInfo = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF || 'local',
  }

  const buildInfoPath = path.join(__dirname, '../.next/build-info.json')
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2))
  console.log('Build info created:', buildInfoPath)
}

if (require.main === module) {
  buildProduction()
}

export { buildProduction }