# Production deployment

## Required environment variables

Configure these in Vercel for Production and Preview. Never commit their values.

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` and `APP_URL` using the final HTTPS origin
- `TOKEN_PEPPER`
- `CRON_SECRET`
- `UPLOADTHING_TOKEN`
- `MAILTRAP_API_KEY`, `MAILTRAP_INBOX_ID`, `MAIL_FROM_EMAIL`, and `MAIL_FROM_NAME`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` only during the one-time admin bootstrap

Every credential previously shared through chat must be rotated before launch.

## First deployment

1. Enable **Allow Overriding ACL** in UploadThing. Private uploads also require an UploadThing plan that supports private files.
2. Set `ALLOW_ADMIN_BOOTSTRAP=true`, then run `npm run db:migrate` and `npm run db:seed` once with the production environment.
3. Immediately set `ALLOW_ADMIN_BOOTSTRAP=false` and remove `ADMIN_PASSWORD` from the environment.
4. Verify `/api/health`, admin login, a private proof signed URL, a Mailtrap sandbox message, and an end-to-end zero-risk test order before opening sales.
5. Replace `saudi-expo.vercel.app` in canonical, sitemap, and robots metadata if a custom domain is used.

## Routine verification

Run `npm run check`, `node scripts/smoke.js`, and `npm audit` before deployment. The smoke script performs read-only service checks plus a rejected-order guard; it does not create an order.

Order reads and product catalog requests expire stale orders immediately. The daily `/api/cron/expire` job is a maintenance fallback compatible with Vercel Hobby scheduling limits; Vercel supplies its bearer token from `CRON_SECRET`.
