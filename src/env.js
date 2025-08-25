import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ADMIN_EMAIL: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AWS_BUCKET_NAME: z.string().min(1),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_ID: z.string().min(1),
    AWS_SECRET: z.string().min(1),
    AUTH_RESEND_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Restaurant"),
  },
  runtimeEnv: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_ID: process.env.AWS_ACCESS_ID,
    AWS_SECRET: process.env.AWS_SECRET,
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
