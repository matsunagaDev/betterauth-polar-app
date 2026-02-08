import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql/web';
import * as authSchemas from "./schemas/auth";
import * as postSchemas from "./schemas/posts";


export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || "local"
  },
  schema: {
    ...authSchemas,
    ...postSchemas
  },
});
