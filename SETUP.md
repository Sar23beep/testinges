# Veloura local setup

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- A Cloudinary account for profile images

## Run locally

1. Copy `.env.example` to `.env`.
2. Set a random `SESSION_SECRET` with at least 32 characters.
3. Set `MONGODB_URI` and the three Cloudinary credentials.
4. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` of at least 10 characters (12 or more is recommended).
5. Run:

```powershell
npm install
npm run seed:admin
npm run dev
```

Open `http://localhost:3000` for the directory and `http://localhost:3000/admin/login` for administration.

## Optional, clearly marked demo records

No sample records are inserted automatically. To add one explicitly labelled demo city, category, and profile:

```powershell
$env:ALLOW_DEMO_SEED = 'true'
npm run seed:demo
```

This inserts six clearly fictional 18+ demo profiles across Mumbai, Delhi, and Bangalore, along with three original generated fashion portraits stored locally under `public/images/demo`. Production profile uploads continue to use Cloudinary.

## Verification

```powershell
npm run check
```

This checks JavaScript syntax, compiles every EJS template, and runs unit tests. End-to-end MongoDB and Cloudinary checks require configured live services. Before deployment, manually verify the checklist in the original specification with authorized content and confirm the privacy/terms text against applicable local law.

## Production notes

- Set `NODE_ENV=production`, use HTTPS, and set `BASE_URL` to the canonical origin.
- Use a dedicated least-privilege MongoDB user and Cloudinary folder/account policy.
- Place the app behind a trusted reverse proxy and configure backups, monitoring, log retention, and an incident response contact.
- Keep `.env` out of version control. Rotate any credential that is accidentally exposed.
- Draft and hidden profiles, unverified profiles, deleted profiles, empty city/category combinations, admin routes, and search pages are excluded from indexing.
