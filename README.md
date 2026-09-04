# ShortenURL

A modern, fast, and minimal self-hosted URL Shortener built with Next.js 15, Tailwind CSS, and SQLite. Perfect for personal branding or managing links across multiple domains.

## Features

- **Blazing Fast**: Built on Next.js 15 App Router.
- **Multi-Domain Support**: Manage multiple custom domains (e.g., `link.yourdomain.com`, `s.id`) in one dashboard.
- **Analytics & Tracking**: 7-day visual graphs tracking clicks, referrers, and IPs using Recharts.
- **QR Code Generator**: Instantly generate and download QR codes for every shortened URL.
- **Tags Management**: Organize your links easily with custom tags.
- **Dark Mode**: Beautiful Vercel-like deep black dark mode support.
- **Lightweight**: Uses SQLite so you don't need to host a separate database server.

## Installation (Self-Hosted via Docker)

The easiest way to run ShortenURL is using Docker and Docker Compose. It works perfectly on any VPS.

### Prerequisites
- Docker & Docker Compose installed on your server.
- A reverse proxy (Nginx, aaPanel, or Cloudflare Tunnels) to route traffic to port `3000`.

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yusufparker/shortenurl.git
   cd shortenurl
   ```

2. **Configure Environment Variables**
   Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your `ADMIN_PASSWORD` (this is the password you will use to log into the dashboard).

3. **Run with Docker Compose**
   ```bash
   docker compose up -d
   ```

4. **Initialize Database**
   Since SQLite is used and stored safely in a Docker volume, you need to push the schema on the first run:
   ```bash
   docker exec nextjs-shortener npx prisma db push
   ```

5. **Done!**
   The app is now running on `http://localhost:3000`. Configure your Nginx or Cloudflare Tunnel to point your custom domain to this port.

## Setting Up Multiple Domains

1. Point your new domain's DNS A Record to your VPS IP (or configure Cloudflare Tunnels/Rules to route traffic to port `3000`).
2. Login to the ShortenURL Dashboard.
3. Go to **Manage Domains** and add your domain (e.g., `link.yourcompany.com`).
4. You can now select this domain from the dropdown when creating a new short link.

## Tech Stack
- Next.js 15 (React 19)
- Tailwind CSS v4
- Prisma ORM (SQLite)
- Lucide Icons & Recharts

## License
MIT License

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
