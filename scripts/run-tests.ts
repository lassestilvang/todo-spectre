#!/usr/bin/env bun
import { $ } from 'bun'
import { glob } from 'glob'
import { join } from 'path'
import { cwd } from 'process'

async function runTests() {
  console.log('🧪 Starting comprehensive test suite...')

  try {
    // Run all tests
    console.log('🔍 Running all tests...')
    const result = await $`bun test --reporter=verbose --coverage`.quiet()

    if (result.exitCode === 0) {
      console.log('✅ All tests passed successfully!')
      console.log('📊 Test coverage report generated.')
    } else {
      console.error('❌ Some tests failed!')
      process.exit(1)
    }

    // Generate coverage report
    console.log('📈 Generating coverage report...')
    await $`bun run coverage`.quiet()

    console.log('🎉 Test suite completed successfully!')

  } catch (error) {
    console.error('💥 Error running tests:', error)
    process.exit(1)
  }
}

runTests()