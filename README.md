# Marosa Map App

A React-based interactive map application for locating Marosa stores.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` and add your Google Maps API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

#### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **APIs & Services > Credentials**
5. Create a new API key
6. (Recommended) Add restrictions:
   - Application restrictions: HTTP referrers
   - API restrictions: Restrict key to "Maps JavaScript API"

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Deployment

Make sure to set the `VITE_GOOGLE_MAPS_API_KEY` environment variable in your deployment platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **GitHub Actions**: Repository Settings → Secrets and variables → Actions

## Security Note

⚠️ **Never commit `.env` files or hardcode API keys in your code.** All sensitive values must be stored as environment variables.