#!/usr/bin/env bun
import { $ } from 'bun'
import { writeFileSync } from 'fs'
import { join } from 'path'

async function generateCoverageReport() {
  console.log('📊 Generating test coverage report...')

  try {
    // Run tests with coverage
    const result = await $`bun test --coverage`.quiet()

    if (result.exitCode !== 0) {
      console.error('❌ Coverage generation failed!')
      process.exit(1)
    }

    console.log('✅ Coverage report generated successfully!')

    // Generate HTML report
    console.log('📄 Generating HTML coverage report...')
    await $`bun run coverage:html`.quiet()

    console.log('🎉 Coverage report completed!')

  } catch (error) {
    console.error('💥 Error generating coverage report:', error)
    process.exit(1)
  }
}

generateCoverageReport()