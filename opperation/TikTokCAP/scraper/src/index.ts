#!/usr/bin/env node

import { validateConfig } from './config.js'
import { loginAndClose } from './playwright/login.js'
import { scrapeAndSave } from './playwright/product-pool.js'

const COMMANDS = {
  login: {
    description: 'Login to Partner Center and save cookies',
    handler: loginAndClose,
  },
  scrape: {
    description: 'Scrape product pool data',
    handler: scrapeAndSave,
  },
}

function printHelp(): void {
  console.log(`
TikTok Shop Affiliate Product Pool Scraper

Usage: npm run <command>

Commands:
  login   - Login to Partner Center and save cookies
  scrape  - Scrape product pool data

Examples:
  npm run login    # First, login and save cookies
  npm run scrape   # Then, scrape product data

Setup:
  1. Copy .env.example to .env
  2. Fill in your Partner Center credentials
  3. Run: npm install
  4. Run: npx playwright install chromium
  5. Run: npm run login
  6. Run: npm run scrape
`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp()
    process.exit(0)
  }

  const cmd = COMMANDS[command as keyof typeof COMMANDS]
  if (!cmd) {
    console.error(`Unknown command: ${command}`)
    printHelp()
    process.exit(1)
  }

  try {
    // 環境変数をバリデート
    validateConfig()

    console.log(`Running: ${command}`)
    console.log('=' .repeat(50))

    await cmd.handler()

    console.log('=' .repeat(50))
    console.log('Done!')
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
