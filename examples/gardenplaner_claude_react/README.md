# Garden Planner – Claude React App

An AI-powered garden planner built with React, TypeScript, Vite, and an Express backend using Claude as the AI engine.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- npm (included with Node.js)
- An Anthropic API key (for Claude)

## 1. Configure environment variables

Copy `.env.example` to `.env` and adjust the values:

```bash
cp .env.example .env
```

Then open `.env` and fill it in:

| Variable | Required | Description |
|---|---|---|
| `APP_ENCRYPTION_KEY` | Yes | 64 hex characters (32 bytes) – encrypts sensitive settings such as the API key |
| `PORT` | No | Backend server port (default: `3001`) |
| `JWT_SECRET` | Recommended | Secret used for JWT tokens; must be set in production |

### Generate an encryption key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the generated value as `APP_ENCRYPTION_KEY`.

### Example `.env`

```env
APP_ENCRYPTION_KEY=a1b2c3d4e5f6...  # 64 hex characters
JWT_SECRET=my-secure-secret
# PORT=3001
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start the app

### Development mode (frontend + backend at the same time)

```bash
npm run dev
```

Starts the Express API server (`tsx watch`) and the Vite dev server in parallel.

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)

### Production: build the app

```bash
npm run build
```

Compiles TypeScript and creates the optimized frontend build in `dist/`.

### Production: start the server

```bash
npm start
```

Starts only the Express server, which also serves the built frontend files.

## Additional scripts

| Command | Description |
|---|---|
| `npm run server:dev` | Start only the API server (without frontend) |
| `npm run client:dev` | Start only the Vite dev server |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the built frontend locally |
