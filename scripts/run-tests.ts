#!/usr/bin/env bun
import { execSync } from 'child_process'

async function runTests() {
  console.log('🧪 Starting comprehensive test suite...')

  try {
    // Run all tests
    console.log('🔍 Running all tests...')
    try {
      execSync('bun test --coverage', { stdio: 'inherit' })
      console.log('✅ All tests passed successfully!')
      console.log('📊 Test coverage report generated.')
    } catch {
      console.error('❌ Some tests failed!')
      process.exit(1)
    }

    // Generate coverage report
    console.log('📈 Generating coverage report...')
    try {
      execSync('bun run coverage', { stdio: 'inherit' })
    } catch {
      console.error('❌ Coverage generation failed!')
      process.exit(1)
    }

    console.log('🎉 Test suite completed successfully!')

  } catch {
    console.error('💥 Error running tests')
    process.exit(1)
  }
}

runTests()