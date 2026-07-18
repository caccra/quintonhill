# Quinton Hill Concierge Services

Website for **Quinton Hill Concierge Services Ltd** — Uganda's premier business concierge based in Kololo, Kampala.

## Stack

- **Server:** Node.js built-in `http` module (no framework)
- **Pages:** 6 static HTML files with full SEO, Open Graph, and JSON-LD structured data
- **Email:** nodemailer + Gmail SMTP (contact form)
- **Fonts:** Manrope (headings) + Inter (body/buttons) via Google Fonts

## Pages

| Route | File |
|---|---|
| `/` | index.html |
| `/about` | about.html |
| `/services` | services.html |
| `/process` | process.html |
| `/clients` | clients.html |
| `/contact` | contact.html |

## Running Locally

```bash
npm install
set GMAIL_PASS=your16charapppassword
node server.js
```

Server starts at `http://localhost:3000`.

## Contact Form Email

The form posts to `/contact/submit` and sends to `quintonhillconcierge@gmail.com` via Gmail SMTP.

**Setup required:**
1. Enable 2-Step Verification on the Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Set the environment variable before starting: `set GMAIL_PASS=<app-password>`

## SEO Files

| File | Purpose |
|---|---|
| `sitemap.xml` | XML sitemap for search engines |
| `robots.txt` | Crawler instructions + sitemap pointer |
| `llms.txt` | AI crawler context (ChatGPT, Perplexity) |

## Registration

Quinton Hill Concierge Services Ltd · Registration No. **80030889551310** · Uganda
