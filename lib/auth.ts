import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { baseUrl } from '@/lib/base-url';
import { nextCookies } from 'better-auth/next-js';
import { anonymous } from 'better-auth/plugins';
import { nanoid } from 'nanoid'

export const auth = betterAuth({
  baseURL: baseUrl(),
  database: drizzleAdapter(db, {
    provider: 'sqlite', // or "pg" or "mysql"
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: () => nanoid(10),
    },
  },
  emailAndPassword: {    
    enabled: true
  },
  socialProviders: { 
    github: { 
        clientId: process.env.GITHUB_CLIENT_ID!, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
    } 
  }, 
  plugins: [
    nextCookies(),
    anonymous(), // 匿名ログイン
  ],
});
