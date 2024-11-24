import { defineConfig } from 'drizzle-kit'
import { env } from '@/env'

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'turso',
  out: './drizzle',
  dbCredentials: { url: env.TURSO_DATABASE_URL },
  verbose: true,
  strict: true
})
