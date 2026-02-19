# daberni-web
Daberni webpage (coming soon)

## Deployment (Cloudflare Pages)

This site is deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Local Development

```bash
npm install
npm run dev
```

### Deploy via CLI

```bash
npm install
npm run deploy
```

### Deploy via Git Integration

1. Push this repository to GitHub.
2. In the Cloudflare dashboard go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select this repository.
4. Set **Build command** to _(leave empty)_ and **Build output directory** to `/`.
5. Click **Save and Deploy**.

Custom domains are configured in the Cloudflare dashboard under your Pages project settings.
