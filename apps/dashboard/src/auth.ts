import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { memoryAdapter } from "better-auth/adapters/memory";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

let cachedAuth: any = null;
let cachedD1Ref: any = null;

export function getAuth(d1?: any, options?: { secret?: string; baseURL?: string }) {
  // If we already initialized with this exact database reference, reuse it
  if (cachedAuth && cachedD1Ref === (d1 || null)) {
    return cachedAuth;
  }

  const databaseConfig = d1
    ? {
        db: new Kysely({
          dialect: new D1Dialect({ database: d1 }),
        }),
        type: "sqlite" as const,
      }
    : memoryAdapter({ user: [], session: [], account: [], verification: [] });

  const secret =
    options?.secret ||
    (typeof process !== "undefined" ? process.env?.BETTER_AUTH_SECRET : undefined) ||
    "kindminds-trauma-informed-better-auth-secret-key-32-chars-min";

  const baseURL =
    options?.baseURL ||
    (typeof process !== "undefined" ? process.env?.BETTER_AUTH_URL : undefined) ||
    "https://kindminds-dashboard.aakashbisht1204.workers.dev";

  const auth = betterAuth({
    database: databaseConfig,
    secret,
    baseURL,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    advanced: {
      database: {
        validateSchema: false,
      },
    },
    plugins: [
      anonymous({
        emailDomainName: "anonymous.kindminds.ai",
      }),
    ],
  });

  cachedAuth = auth;
  cachedD1Ref = d1 || null;
  return auth;
}

export type Auth = ReturnType<typeof getAuth>;
