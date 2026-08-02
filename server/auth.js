import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "./db/index.js";
import { schema } from "./db/schema.js";
import { sendEmail } from "./mail.js";
import { eq } from "drizzle-orm";
import { user } from "./db/schema.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null,
  ].filter(Boolean),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.ALLOW_ADMIN_BOOTSTRAP !== "true",
    minPasswordLength: 12,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user: targetUser, url }) => {
      await sendEmail({
        to: targetUser.email,
        subject: "Reset password dashboard SEE 2026",
        text: `Buka tautan berikut untuk mengatur ulang password: ${url}`,
        html: `<h1>Reset password</h1><p><a href="${url}">Atur ulang password dashboard</a></p>`,
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: ["ADMIN", "FINANCE", "CHECKIN", "VIEWER"], required: false, defaultValue: "VIEWER", input: false },
      banned: { type: "boolean", required: false, defaultValue: false, input: false, returned: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request) {
  return auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
}

export const requireRole = (...roles) => async (request, response, next) => {
  try {
    const currentSession = await getSession(request);
    const currentUser = currentSession?.user
      ? await db.query.user.findFirst({ where: eq(user.id, currentSession.user.id) })
      : null;
    if (!currentUser || currentUser.banned || !roles.includes(currentUser.role)) {
      return response.status(401).json({ error: "Sesi tidak valid atau akses ditolak." });
    }
    request.auth = { ...currentSession, user: currentUser };
    next();
  } catch {
    response.status(401).json({ error: "Sesi tidak valid." });
  }
};
