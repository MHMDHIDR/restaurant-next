// app/api/test-db/route.ts
import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function GET() {
  try {
    // Try to query the users table
    const testQuery = await db.query.users.findFirst()
    return NextResponse.json({ status: "Database connection successful", testQuery })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({ status: "Database connection failed", error }, { status: 500 })
  }
}
