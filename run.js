#!/usr/bin/env node

import { existsSync } from 'fs'
import { parseArgs } from 'node:util'

if (existsSync('.env')) {
  const { config } = await import('dotenv')
  config()
}

const [,, _module, ...args] = process.argv

const run = (await import(_module)).default
const innerArgs = parseArgs({ args, strict: false })

console.log(await run(innerArgs.values))
