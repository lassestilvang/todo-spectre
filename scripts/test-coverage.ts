#!/usr/bin/env bun
import { execSync } from 'child_process'

async function generateCoverageReport() {
  console.log('📊 Generating test coverage report...')

  try {
    // Run tests with coverage
    try {
      execSync('bun test --coverage', { stdio: 'inherit' })
    } catch {
      console.error('❌ Coverage generation failed!')
      process.exit(1)
    }

    console.log('✅ Coverage report generated successfully!')

    // Generate HTML report
    console.log('📄 Generating HTML coverage report...')
    try {
      execSync('bun run coverage:html', { stdio: 'inherit' })
    } catch {
      console.error('❌ HTML coverage generation failed!')
      process.exit(1)
    }

    console.log('🎉 Coverage report completed!')

  } catch {
    console.error('💥 Error generating coverage report')
    process.exit(1)
  }
}

generateCoverageReport()