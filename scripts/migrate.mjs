// One-off setup script: creates the tables and seeds 79 blank sites if they
// don't exist yet. Safe to re-run any time (e.g. after a schema change).
//
// Usage:  node --env-file=.env.local scripts/migrate.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local first — see README.md.')
  process.exit(1)
}

const sql = neon(url)
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
const schema = readFileSync(schemaPath, 'utf8')

console.log('Applying schema...')
await sql(schema)

const [{ count }] = await sql`SELECT count(*)::int AS count FROM sites`
if (count === 0) {
  console.log('Seeding 79 sites (numbered 1-79, all with default/blank attributes)...')
  const numbers = Array.from({ length: 79 }, (_, i) => String(i + 1))
  for (const number of numbers) {
    await sql`INSERT INTO sites (number) VALUES (${number}) ON CONFLICT (number) DO NOTHING`
  }
  console.log('Done. Go to the Sites page in the app to set each site\'s real attributes (powered, pet-friendly, size, etc.) whenever you\'re ready — the tool works fine with the defaults in the meantime.')
} else {
  console.log(`Sites table already has ${count} rows, skipping seed.`)
}

console.log('Setup complete.')
