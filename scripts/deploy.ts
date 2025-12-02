import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import deployConfig from '../deploy.config'

// Type for the deploy config
type DeployConfig = {
  targets: {
    [key: string]: {
      provider: string
      name: string
      script: string
      env?: {
        [key: string]: {
          [key: string]: string
        }
      }
    }
  }
  build?: {
    command: string
    output: string
    basePath: string
    assetPrefix: string
    cleanUrls: boolean
    trailingSlash: boolean
  }
  env?: {
    [key: string]: string
  }
}

async function deploy(target: string = 'vercel', environment: string = 'production') {
  console.log(`Starting deployment to ${target} (${environment})...`)

  try {
    // Validate target
    const config = deployConfig as unknown as DeployConfig
    if (!config.targets[target]) {
      throw new Error(`Unknown deployment target: ${target}`)
    }

    const targetConfig = config.targets[target]

    // Set environment variables
    console.log('Setting environment variables...')
    setEnvironmentVariables(environment)

    // Run pre-deployment checks
    console.log('Running pre-deployment checks...')
    await runPreDeploymentChecks()

    // Build for production
    console.log('Building for production...')
    execSync('bunx tsx scripts/build-production.ts', { stdio: 'inherit' })

    // Run deployment specific script
    console.log(`Running ${target} deployment...`)
    execSync(targetConfig.script, { stdio: 'inherit' })

    // Run post-deployment tasks
    console.log('Running post-deployment tasks...')
    await runPostDeploymentTasks(target, environment)

    console.log(`Deployment to ${target} (${environment}) completed successfully!`)
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exit(1)
  }
}

function setEnvironmentVariables(environment: string) {
  const config = deployConfig as unknown as DeployConfig

  // Set environment variables from deploy config
  if (config.env) {
    Object.entries(config.env).forEach(([key, value]) => {
      if (typeof value === 'string') {
        process.env[key] = value
      }
    })
  }

  // Set target-specific environment variables
  Object.entries(config.targets).forEach(([, targetConfig]) => {
    if (targetConfig.env && targetConfig.env[environment]) {
      Object.entries(targetConfig.env[environment]).forEach(([key, value]) => {
        process.env[key] = value
      })
    }
  })
}

async function runPreDeploymentChecks() {
  // Check if we're on the right branch for production
  if (process.env.NODE_ENV === 'production' && process.env.GITHUB_REF !== 'refs/heads/main') {
    console.warn('Warning: Deploying production from non-main branch')
  }

  // Check if all required environment variables are set
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '))
  }

  // Check database connection
  console.log('Checking database connection...')
  try {
    execSync('bun run db:health', { stdio: 'inherit' })
  } catch (error) {
    console.error('Database health check failed:', error)
    throw new Error('Database connection failed')
  }
}

async function runPostDeploymentTasks(target: string, environment: string) {
  // Run database migrations on target
  if (environment === 'production') {
    console.log('Running production database migrations...')
    execSync('bun run db:migrate-full', { stdio: 'inherit' })
  }

  // Clear caches if needed
  if (target === 'vercel') {
    console.log('Clearing Vercel caches...')
    // Would add actual cache clearing logic here
  }

  // Log deployment info
  logDeploymentInfo(target, environment)
}

function logDeploymentInfo(target: string, environment: string) {
  const deploymentInfo = {
    target,
    environment,
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF || 'local',
  }

  const logPath = path.join(__dirname, `../deployments/${target}-${environment}-${Date.now()}.json`)
  fs.writeFileSync(logPath, JSON.stringify(deploymentInfo, null, 2))
  console.log('Deployment logged:', logPath)
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const target = args[0] || 'vercel'
  const environment = args[1] || 'production'

  return { target, environment }
}

if (require.main === module) {
  const { target, environment } = parseArgs()
  deploy(target, environment)
}

export { deploy }