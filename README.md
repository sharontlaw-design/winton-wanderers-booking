# Winton Wanderers Booking

A simple booking tool for a caravan park: type in a name, phone number, dates
and any special requirements, and it finds a matching site, and generates
the confirmation text and receipt ready to send.

## What it does (Phase 1)

- **Site map** — see all sites at a glance, colored by status (available /
  booked / checked in).
- **New booking** — enter guest details + dates + requirements (powered,
  pet-friendly, waterfront, accessible, size), and it shows which sites are
  free and match.
- **Message + receipt** — auto-generates the confirmation text and receipt
  text for a booking. If a Twilio number is configured it sends the text
  directly; otherwise it copies the message to your clipboard so you can
  paste it into a normal text message.
- **Card deposits (optional)** — if Stripe is configured, the confirmation
  text includes a secure payment link instead of asking the guest to pay
  over the phone. Once they pay, the booking is marked paid and the receipt
  is sent automatically — no action needed. Without Stripe set up, deposits
  stay exactly as manual as before.

Not yet built (Phase 2): automatically pulling in bookings from email and
incoming texts. That needs a Twilio number and some email forwarding setup —
worth doing once Phase 1 is comfortable to use day-to-day.

## One-time setup

You'll need two free accounts:

1. **Neon** (database) — https://neon.tech. Sign up free, create a project,
   copy the connection string (looks like `postgresql://...`).
2. **Vercel** (hosting) — https://vercel.com. Sign up free, this is what
   makes the app a real website you can open from any computer or phone.

Twilio (for sending texts automatically) can wait — the app works without
it, see below.

### Local setup (for development)

```
npm install
cp .env.local.example .env.local
# edit .env.local: paste in DATABASE_URL, pick an APP_PASSWORD, set PARK_NAME
node --env-file=.env.local scripts/migrate.mjs   # creates tables + 79 blank sites
npm run dev
```

Open http://localhost:3000, log in with the password you set, and go to
**Sites** to fill in each site's real attributes (powered, pet-friendly,
size, etc.) — it works with the defaults in the meantime.

### Deploying so it's a real website

1. Push this repo to GitHub (already done if you're reading this from there).
2. In Vercel, "Add New Project" → import this repo.
3. Add the same environment variables from `.env.local` in the Vercel
   project settings (Settings → Environment Variables).
4. Deploy. Vercel gives you a URL — that's the app.

### Turning on automatic texting (optional, a few cents per message)

1. Sign up at https://twilio.com, buy a phone number (roughly $1-2/month
   plus a few cents per text sent).
2. Copy the Account SID, Auth Token, and the phone number into
   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (locally
   in `.env.local`, and in Vercel's environment variables for the live site).
3. Redeploy. The Send buttons will now actually send the text instead of
   copying it to the clipboard.

### Taking deposits by card (optional — Stripe charges roughly 1.75% + $0.30 per transaction in Australia, nothing upfront)

1. Sign up free at https://stripe.com and finish their business verification
   (needed before Stripe will pay out to a real bank account).
2. In Stripe's Dashboard → Developers → API keys, copy the **secret key**
   into `STRIPE_SECRET_KEY`.
3. Once deployed, in Stripe's Dashboard → Developers → Webhooks, add an
   endpoint for `https://<your-deployed-url>/api/stripe/webhook`, listening
   for the `checkout.session.completed` event. Copy the **signing secret**
   it gives you into `STRIPE_WEBHOOK_SECRET`.
4. Set `APP_BASE_URL` to your real deployed URL (e.g.
   `https://winton-wanderers.vercel.app`).
5. In Stripe's Dashboard → Settings → Payouts, set the payout schedule to
   **daily** so takings land in the bank account automatically each day —
   that's a Stripe setting, nothing to configure here.
6. Redeploy. New confirmation messages now include a secure payment link
   when a deposit is still owing.

Reconciling those daily payouts in accounting software (e.g. Xero) is a
separate, later decision — Xero charges its own ongoing subscription, so
it's not assumed here. When that's wanted, connecting Stripe to Xero's bank
feed is a standard Xero/Stripe setting, not something this app needs to do.

## What's recorded per booking

Name, phone number, vehicle rego, site, check-in/check-out dates, deposit
amount paid, any notes, status (booked / checked in / checked out), and —
if paid by card — when it was paid.
