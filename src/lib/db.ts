import { neon } from '@neondatabase/serverless'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set. Add it to your .env.local file.')
  return neon(url)
}

// Tagged-template helper: `sql\`SELECT * FROM sites WHERE id = ${id}\``
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getDb()(strings, ...values)
}
