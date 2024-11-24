import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@/env'

declare global {
  var db: ReturnType<typeof drizzle> | undefined
}

let db: ReturnType<typeof drizzle>

if (env.NODE_ENV === 'production') {
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN
  })
  db = drizzle(client)
} else {
  if (!global.db) {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    })
    global.db = drizzle(client)
  }
  db = global.db
}

export { db }
