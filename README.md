<<<<<<< HEAD
# Pixelvault

Production-ready wallpaper site with admin panel + TOTP 2FA.

## Quick start

1. `npm install`
2. Copy `.env.example` â†’ `.env.local`
3. Generate two secrets (run twice):  `npm run secret`
   - First â†’ `JWT_SECRET`
   - Second â†’ `ENCRYPTION_KEY`
4. Fill in MongoDB and Cloudinary creds in `.env.local`
5. `npm run seed`   (creates default categories)
6. `npm run dev`    (open http://localhost:3000)
7. Visit `/admin` â†’ first-time setup:
   - Pick username
   - Scan QR with Google Authenticator / Authy / 1Password
   - Set strong password
   - **Save the 10 recovery codes** â€” shown ONCE
8. Log in with username + password + 6-digit code

## Deploy to Vercel

1. Push to GitHub
2. vercel.com â†’ New Project â†’ import repo
3. Paste env vars from `.env.local` into Vercel settings
4. Deploy

## Forgot password?

Visit `/admin/reset` â€” supply username, new password, plus either:
- A current 6-digit TOTP code, OR
- One of your saved recovery codes

If you lose BOTH your authenticator AND recovery codes, you must reset the User collection in MongoDB Atlas.
=======
# pixelvault
Premium HD and 4K wallpapers website built with Next.js. Infinite scroll, fast loading, and responsive design.
>>>>>>> 1dfb81a4a67497ac37150f2af32ad53c9909d85e
